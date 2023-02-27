import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request } from 'express';
import {
	CreateDeliveryUserInput,
	CustomerLoginInput,
	EditCustomerProfileInput,
	FindDeliveryUserOptions
} from '../dto';
import {
	asyncWrapper,
	createCustomError,
	generateSignature
} from '../middleware';
import { DeliveryUser, DeliveryUserDoc } from '../models';
import { generatePassword, generateSalt, validatePassword } from '../utils';

export const deliveryUserSignup = asyncWrapper(
	async (req: Request<any, any, CreateDeliveryUserInput>, res, next) => {
		const deliveryUserSignupInputs = plainToClass(
			CreateDeliveryUserInput,
			req.body
		);
		const errors = await validate(deliveryUserSignupInputs, {
			validationError: { target: true }
		});

		if (errors.length > 0) {
			return next(createCustomError('Input validation errors', 400, errors));
		}

		const { password } = deliveryUserSignupInputs;

		const isExistingDeliveryUser = await findDeliveryUser(
			deliveryUserSignupInputs
		);

		if (isExistingDeliveryUser) {
			return next(
				createCustomError('Delivery user already exists', 400, errors)
			);
		}

		const salt = await generateSalt();
		const hashedPassword = await generatePassword(password, salt);

		const createDeliveryUser = await DeliveryUser.create({
			...deliveryUserSignupInputs,
			salt,
			password: hashedPassword
		});

		if (!createDeliveryUser) {
			return next(createCustomError('Delivery user creation failed', 500));
		}

		const signature = generateSignature({
			_id: createDeliveryUser._id,
			email: createDeliveryUser.email,
			verified: createDeliveryUser.verified
		});

		return res
			.status(201)
			.json({ ...JSON.parse(JSON.stringify(createDeliveryUser)), signature });
	}
);

export const deliveryUserLogin = asyncWrapper(
	async (req: Request<any, any, CustomerLoginInput>, res, next) => {
		const deliveryUserLoginInputs = plainToClass(CustomerLoginInput, req.body);
		const errors = await validate(deliveryUserLoginInputs, {
			validationError: { target: true }
		});

		if (errors.length > 0) {
			return next(createCustomError('Input validation errors', 400, errors));
		}

		const { email, password } = deliveryUserLoginInputs;

		const deliveryUser = await findDeliveryUser({ email });

		if (!deliveryUser) {
			return next(createCustomError('Delivery user not found', 404));
		}

		const isPasswordValid = await validatePassword(
			password,
			deliveryUser.password,
			deliveryUser.salt
		);

		if (!isPasswordValid) {
			return next(createCustomError('Invalid credentials', 401));
		}

		const signature = generateSignature({
			_id: deliveryUser._id,
			email: deliveryUser.email,
			verified: deliveryUser.verified
		});

		return res
			.status(201)
			.json({ ...JSON.parse(JSON.stringify(deliveryUser)), signature });
	}
);

export const getDeliveryUserProfile = asyncWrapper(async (req, res, next) => {
	const deliveryUser = (await validateAndReturnDeliveryUser(
		req,
		next
	)) as DeliveryUserDoc;

	return res.status(200).json(deliveryUser);
});

export const editDeliveryUserProfile = asyncWrapper(
	async (req: Request<any, any, EditCustomerProfileInput>, res, next) => {
		const deliveryUserProfileInputs = plainToClass(
			EditCustomerProfileInput,
			req.body
		);
		const errors = await validate(deliveryUserProfileInputs, {
			validationError: { target: true }
		});

		if (errors.length > 0) {
			return next(createCustomError('Input validation errors', 400, errors));
		}

		const deliveryUser = (await validateAndReturnDeliveryUser(
			req,
			next
		)) as DeliveryUserDoc;

		const { firstName, lastName, address } = deliveryUserProfileInputs;
		deliveryUser.firstName = firstName;
		deliveryUser.lastName = lastName;
		deliveryUser.address = address;

		await deliveryUser.save();

		return res.status(200).json(deliveryUser);
	}
);

export const updateDeliveryUserStatus = asyncWrapper(async (req, res, next) => {
	const deliveryUser = (await validateAndReturnDeliveryUser(
		req,
		next
	)) as DeliveryUserDoc;

	const { lat, lng } = <{ lat?: number; lng?: number }>req.body;

	if (lat && lng) {
		deliveryUser.lat = lat;
		deliveryUser.lng = lng;
	}

	deliveryUser.isAvailable = !deliveryUser.isAvailable;

	await deliveryUser.save();

	return res.status(200).json(deliveryUser);
});

export const findDeliveryUser = async ({
	id,
	email,
	phone
}: FindDeliveryUserOptions) => {
	if (id) {
		return await DeliveryUser.findById(id);
	}

	return await DeliveryUser.findOne({
		$or: [{ email }, { phone }]
	});
};

const validateAndReturnDeliveryUser = async (
	req: Request,
	next: NextFunction
) => {
	const user = req.user;
	if (!user) {
		return next(createCustomError('User not found', 404));
	}

	const deliveryUser = await findDeliveryUser({ id: user._id });
	if (!deliveryUser) {
		return next(createCustomError('Delivery user not found', 404));
	}

	return deliveryUser;
};
