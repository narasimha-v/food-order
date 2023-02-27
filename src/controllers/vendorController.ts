import { NextFunction, Request } from 'express';
import {
	CreateFoodInput,
	CreateOfferInput,
	EditVendorInput,
	OfferType,
	ProcessOrder,
	VendorLoginInput
} from '../dto';
import {
	asyncWrapper,
	createCustomError,
	generateSignature
} from '../middleware';
import {
	Food,
	Offer,
	OfferDoc,
	Order,
	OrderStatus,
	VendorDoc
} from '../models';
import { validatePassword } from '../utils';
import { findVendor } from './adminController';

export const vendorLogin = asyncWrapper(
	async (req: Request<any, any, VendorLoginInput>, res, next) => {
		const { email, password } = req.body;

		const vendor = await findVendor({ email });
		if (!vendor) {
			return next(createCustomError('Vendor not found', 404));
		}

		const isPasswordValid = await validatePassword(
			password,
			vendor.password,
			vendor.salt
		);
		if (!isPasswordValid) {
			return next(createCustomError('Invalid credentials', 401));
		}

		const signature = generateSignature({
			_id: vendor._id,
			name: vendor.name,
			email: vendor.email,
			foodType: vendor.foodType
		});

		return res
			.status(200)
			.json({ ...JSON.parse(JSON.stringify(vendor)), signature });
	}
);

export const getVendorProfile = asyncWrapper(async (req, res, next) => {
	const vendor = (await validateAndReturnVendor(req, next)) as VendorDoc;

	return res.status(200).json(vendor);
});

export const updateVendorProfile = asyncWrapper(
	async (req: Request<any, any, EditVendorInput>, res, next) => {
		const vendor = (await validateAndReturnVendor(req, next)) as VendorDoc;

		partialUpdateVendor(vendor, req);

		await vendor.save();

		return res.status(200).json(vendor);
	}
);

export const updateVendorService = asyncWrapper(async (req, res, next) => {
	const { lat, lng } = req.body as { lat?: number; lng?: number };

	const vendor = (await validateAndReturnVendor(req, next)) as VendorDoc;

	vendor.serviceAvailable = !vendor.serviceAvailable;

	if (lat && lng) {
		vendor.lat = lat;
		vendor.lng = lng;
	}

	await vendor.save();

	return res.status(200).json(vendor);
});

export const addFood = asyncWrapper(
	async (req: Request<any, any, CreateFoodInput>, res, next) => {
		const vendor = (await validateAndReturnVendor(req, next)) as VendorDoc;

		const files = (req.files || []) as Express.Multer.File[];
		const images = files.map((file) => file.filename);

		const createFood = await Food.create({
			...req.body,
			images: images,
			vendorId: vendor._id
		});

		vendor.foods.push(createFood);
		await vendor.save();

		return res.status(201).json(vendor);
	}
);

export const getFoods = asyncWrapper(async (req, res, next) => {
	const vendor = (await validateAndReturnVendor(req, next)) as VendorDoc;
	const foods = await Food.find({ vendorId: vendor._id });
	return res.status(200).json(foods);
});

/* ------------------------ Orders ------------------------  */

export const getCurrentOrders = asyncWrapper(async (req, res, next) => {
	const vendor = (await validateAndReturnVendor(req, next)) as VendorDoc;

	const orders = await Order.find({
		vendorId: vendor._id,
		status: { $ne: OrderStatus.DELIVERED }
	}).populate('items.food');

	if (!orders.length) {
		return res.status(200).json({ message: 'No new orders' });
	}

	return res.status(200).json(orders);
});

export const getOrderDetails = asyncWrapper(async (req, res, next) => {
	const vendor = (await validateAndReturnVendor(req, next)) as VendorDoc;

	const orderId = req.params.id;

	const order = await Order.findOne({
		vendorId: vendor._id,
		_id: orderId
	}).populate('items.food');

	if (!order) {
		return next(createCustomError('Order not found', 404));
	}

	return res.status(200).json(order);
});

export const processOrder = asyncWrapper(
	async (req: Request<any, any, ProcessOrder>, res, next) => {
		const vendor = (await validateAndReturnVendor(req, next)) as VendorDoc;

		const orderId = req.params.id;
		const { orderStatus, remarks, time } = req.body;

		const order = await Order.findOne({
			vendorId: vendor._id,
			_id: orderId
		}).populate('items.food');

		if (!order) {
			return next(createCustomError('Order not found', 404));
		}

		order.orderStatus = orderStatus;
		order.remarks = remarks;
		if (time) order.readyTime = time;

		await order.save();

		return res.status(200).json(order);
	}
);

/* ------------------------ Offers ------------------------  */

export const getOffers = asyncWrapper(async (req, res, next) => {
	const vendor = (await validateAndReturnVendor(req, next)) as VendorDoc;

	const offers = await Offer.find({
		$or: [{ vendors: vendor._id }, { offerType: OfferType.GENERIC }]
	});

	return res.status(200).json(offers);
});

export const addOffer = asyncWrapper(
	async (req: Request<any, any, CreateOfferInput>, res, next) => {
		const vendor = (await validateAndReturnVendor(req, next)) as VendorDoc;

		const createOffer = await Offer.create({
			...req.body,
			vendors: [vendor]
		});

		return res.status(201).json(createOffer);
	}
);

export const editOffer = asyncWrapper(
	async (req: Request<any, any, Partial<CreateOfferInput>>, res, next) => {
		const vendor = (await validateAndReturnVendor(req, next)) as VendorDoc;

		const offerId = req.params.id;

		const offer = await Offer.findOne({ vendors: vendor._id, _id: offerId });

		if (!offer) {
			return next(createCustomError('Offer not found', 404));
		}

		partialUpdateOffer(offer, req);

		await offer.save();

		return res.status(200).json(offer);
	}
);

/* ------------------------ Helpers ------------------------  */

const validateAndReturnVendor = async (req: Request, next: NextFunction) => {
	const user = req.user;
	if (!user) {
		return next(createCustomError('User not found', 404));
	}

	const vendor = await findVendor({ id: user._id });
	if (!vendor) {
		return next(createCustomError('Vendor not found', 404));
	}

	return vendor;
};

const partialUpdateVendor = (
	vendor: VendorDoc,
	req: Request<any, any, EditVendorInput>
) => {
	const { name, foodType, address, phone } = req.body;

	const files = (req.files || []) as Express.Multer.File[];
	const images = files.map((file) => file.filename);

	if (name) vendor.name = name;
	if (phone) vendor.phone = phone;
	if (address) vendor.address = address;
	if (foodType) vendor.foodType = foodType;
	if (images.length) vendor.coverImages = images;
};

const partialUpdateOffer = (
	offer: OfferDoc,
	req: Request<any, any, Partial<CreateOfferInput>>
) => {
	if (req.body.bank) offer.bank = req.body.bank;
	if (req.body.bins) offer.bins = req.body.bins;
	if (req.body.title) offer.title = req.body.title;
	if (req.body.pincode) offer.pincode = req.body.pincode;
	if (req.body.vendors) offer.vendors = req.body.vendors;
	if (req.body.minValue) offer.minValue = req.body.minValue;
	if (req.body.offerType) offer.offerType = req.body.offerType;
	if (req.body.promoCode) offer.promoCode = req.body.promoCode;
	if (req.body.promoType) offer.promoType = req.body.promoType;
	if (req.body.description) offer.description = req.body.description;
	if (req.body.offerAmount) offer.offerAmount = req.body.offerAmount;
	if (req.body.endValidity) offer.endValidity = req.body.endValidity;
	if (req.body.isActive !== undefined) offer.isActive = req.body.isActive;
};
