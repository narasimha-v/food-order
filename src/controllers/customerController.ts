import { NextFunction, Request } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import {
	CreateCustomerInput,
	CustomerLoginInput,
	EditCustomerProfileInput,
	FindCustomerOptions,
	OrderInput
} from '../dto';
import {
	asyncWrapper,
	createCustomError,
	generateSignature
} from '../middleware';
import {
	CartItem,
	Customer,
	CustomerDoc,
	Food,
	Order,
	PaymentMethod
} from '../models';
import {
	generateSalt,
	generatePassword,
	generateOtp,
	onRequestOtp,
	validatePassword
} from '../utils';
import { v4 as uuidv4 } from 'uuid';

/* ------------------------ Account service functions ------------------------  */

export const customerSignup = asyncWrapper(
	async (req: Request<any, any, CreateCustomerInput>, res, next) => {
		const customerSignupInputs = plainToClass(CreateCustomerInput, req.body);
		const errors = await validate(customerSignupInputs, {
			validationError: { target: true }
		});

		if (errors.length > 0) {
			return next(createCustomError('Input validation errors', 400, errors));
		}

		const { password, phone } = customerSignupInputs;

		const isExistingCustomer = await findCustomer(customerSignupInputs);

		if (isExistingCustomer) {
			return next(createCustomError('Customer already exists', 400));
		}

		const salt = await generateSalt();
		const hashedPassword = await generatePassword(password, salt);
		const { otp, expiry } = generateOtp();

		const createCustomer = await Customer.create({
			...customerSignupInputs,
			salt,
			password: hashedPassword,
			otp,
			otpExpiry: expiry
		});

		if (!createCustomer) {
			return next(createCustomError('Customer could not be created', 500));
		}

		await onRequestOtp(otp, phone);

		const signature = generateSignature({
			_id: createCustomer._id,
			email: createCustomer.email,
			verified: createCustomer.verified
		});

		return res
			.status(201)
			.json({ ...JSON.parse(JSON.stringify(createCustomer)), signature });
	}
);

export const customerLogin = asyncWrapper(
	async (req: Request<any, any, CustomerLoginInput>, res, next) => {
		const customerLoginInputs = plainToClass(CustomerLoginInput, req.body);
		const errors = await validate(customerLoginInputs, {
			validationError: { target: true }
		});

		if (errors.length > 0) {
			return next(createCustomError('Input validation errors', 400, errors));
		}

		const { email, password } = customerLoginInputs;

		const customer = await findCustomer({ email });

		if (!customer) {
			return next(createCustomError('Customer not found', 404));
		}

		const isPasswordValid = await validatePassword(
			password,
			customer.password,
			customer.salt
		);

		if (!isPasswordValid) {
			return next(createCustomError('Invalid credentials', 401));
		}

		const signature = generateSignature({
			_id: customer._id,
			email: customer.email,
			verified: customer.verified
		});

		return res
			.status(201)
			.json({ ...JSON.parse(JSON.stringify(customer)), signature });
	}
);

export const verifyCustomer = asyncWrapper(
	async (req: Request<any, any, { otp: number }>, res, next) => {
		const { otp } = req.body;

		const customer = (await validateAndReturnCustomer(
			req,
			next
		)) as CustomerDoc;

		if (customer.verified || !customer.otp || !customer.otpExpiry) {
			return next(createCustomError('Customer already verified', 400));
		}

		if (customer.otp !== otp || customer.otpExpiry <= new Date()) {
			return next(createCustomError('Invalid OTP', 400));
		}

		customer.verified = true;
		customer.otp = undefined;
		customer.otpExpiry = undefined;
		const updatedCustomer = await customer.save();

		const signature = generateSignature({
			_id: updatedCustomer._id,
			email: updatedCustomer.email,
			verified: updatedCustomer.verified
		});

		return res
			.status(200)
			.json({ ...JSON.parse(JSON.stringify(updatedCustomer)), signature });
	}
);

export const requestOtp = asyncWrapper(async (req, res, next) => {
	const customer = (await validateAndReturnCustomer(req, next)) as CustomerDoc;

	if (customer.verified) {
		return next(createCustomError('Customer already verified', 400));
	}

	const { otp, expiry } = generateOtp();
	customer.otp = otp;
	customer.otpExpiry = expiry;

	await Promise.all([customer.save(), onRequestOtp(otp, customer.phone)]);

	return res
		.status(200)
		.json({ message: 'OTP sent successfully to your registered phone number' });
});

export const getCustomerProfile = asyncWrapper(async (req, res, next) => {
	const customer = (await validateAndReturnCustomer(req, next)) as CustomerDoc;

	return res.status(200).json(customer);
});

export const editCustomerProfile = asyncWrapper(
	async (req: Request<any, any, EditCustomerProfileInput>, res, next) => {
		const customerProfileInputs = plainToClass(
			EditCustomerProfileInput,
			req.body
		);
		const errors = await validate(customerProfileInputs, {
			validationError: { target: true }
		});

		if (errors.length > 0) {
			return next(createCustomError('Input validation errors', 400, errors));
		}

		const customer = (await validateAndReturnCustomer(
			req,
			next
		)) as CustomerDoc;

		const { firstName, lastName, address } = customerProfileInputs;
		customer.firstName = firstName;
		customer.lastName = lastName;
		customer.address = address;

		await customer.save();

		return res.status(200).json(customer);
	}
);

/* ------------------------ Order service functions ------------------------  */

export const createOrder = asyncWrapper(
	async (req: Request<any, any, OrderInput[]>, res, next) => {
		const customer = (await validateAndReturnCustomer(
			req,
			next
		)) as CustomerDoc;

		const cart = req.body;

		let cartItems: CartItem[] = Array();
		let netAmount = 0.0;

		const foods = await Food.find({
			_id: { $in: cart.map((item) => item._id) }
		});

		for (const item of cart) {
			const food = foods.find((food) => food._id == item._id);

			if (!food) {
				return next(createCustomError('Food not found', 404));
			}

			const price = food.price;
			const quantity = item.quantity;
			const amount = quantity * price;

			cartItems.push({ food, quantity, amount });

			netAmount += amount;
		}

		if (!cartItems.length) {
			return next(createCustomError('Cart is empty', 400));
		}

		const order = await Order.create({
			orderId: uuidv4(),
			vendorId: foods[0].vendorId,
			items: cartItems,
			totalAmount: netAmount,
			paidThrough: PaymentMethod.COD,
			orderDate: new Date()
		});

		if (!order) {
			return next(createCustomError('Order creation failed', 500));
		}

		customer.cart = [];
		customer.orders.push(order);
		await customer.save();
		return res.status(201).json(order);
	}
);

export const getOrders = asyncWrapper(async (req, res, next) => {
	const customer = (await validateAndReturnCustomer(req, next)) as CustomerDoc;

	return res.status(200).json(customer.orders);
});

export const getOrderById = asyncWrapper(async (req, res, next) => {
	const order = await Order.findById(req.params.id).populate('items.food');

	if (!order) {
		return next(createCustomError('Order not found', 404));
	}

	return res.status(200).json(order);
});

/* ------------------------ Cart service functions ------------------------  */

export const addToCart = asyncWrapper(
	async (req: Request<any, any, OrderInput>, res, next) => {
		const customer = (await validateAndReturnCustomer(
			req,
			next
		)) as CustomerDoc;

		const cart = req.body;
		let cartItems = Array<CartItem>();

		const food = await Food.findById(cart._id);

		if (!food) {
			return next(createCustomError('Food not found', 404));
		}

		cartItems = customer.cart;

		if (cartItems.length) {
			const index = cartItems.findIndex(
				(item) => item.food._id.toString() == food._id
			);

			if (index > -1) {
				if (cart.quantity > 0) {
					cartItems[index].quantity += cart.quantity;
					cartItems[index].amount = food.price * cartItems[index].quantity;
				} else {
					cartItems.splice(index, 1);
				}
			} else {
				cartItems.push({
					food,
					quantity: cart.quantity,
					amount: food.price * cart.quantity
				});
			}
		} else {
			cartItems.push({
				food,
				quantity: cart.quantity,
				amount: food.price * cart.quantity
			});
		}

		customer.cart = cartItems;
		await customer.save();

		return res.status(201).json(customer.cart);
	}
);

export const clearCart = asyncWrapper(async (req, res, next) => {
	const customer = (await validateAndReturnCustomer(req, next)) as CustomerDoc;

	customer.cart = [];
	await customer.save();

	return res.status(200).json({ message: 'Cart cleared' });
});

export const getCart = asyncWrapper(async (req, res, next) => {
	const customer = (await validateAndReturnCustomer(req, next)) as CustomerDoc;

	if (!customer.cart.length) {
		return res.status(200).json({ message: 'Cart is empty' });
	}

	return res.status(200).json(customer.cart);
});

const validateAndReturnCustomer = async (req: Request, next: NextFunction) => {
	const user = req.user;
	if (!user) {
		return next(createCustomError('User not found', 404));
	}

	const customer = await findCustomer({ id: user._id });
	if (!customer) {
		return next(createCustomError('Vendor not found', 404));
	}

	return customer;
};

export const findCustomer = async ({
	id,
	email,
	phone
}: FindCustomerOptions) => {
	if (id) {
		return await Customer.findById(id).populate(['orders', 'cart.food']);
	}

	return await Customer.findOne({
		$or: [{ email }, { phone }]
	});
};
