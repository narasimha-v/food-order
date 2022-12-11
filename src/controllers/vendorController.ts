import { NextFunction, Request } from 'express';
import { CreateFoodInput, EditVendorInput, VendorLoginInput } from '../dto';
import {
	asyncWrapper,
	createCustomError,
	generateSignature
} from '../middleware';
import { Food, VendorDoc } from '../models';
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
	const vendor = (await validateAndReturnVendor(req, next)) as VendorDoc;

	vendor.serviceAvailable = !vendor.serviceAvailable;

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
