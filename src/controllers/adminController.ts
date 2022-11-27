import { Request } from 'express';
import { CreateVendorInput, FindVendorOptions, FoodType } from '../dto';
import { asyncWrapper, createCustomError } from '../middleware';
import { Vendor } from '../models';
import { generatePassword, generateSalt } from '../utils';

export const createVendor = asyncWrapper(
	async (req: Request<any, any, CreateVendorInput>, res, next) => {
		// Enable below code for testing purposes only
		await Vendor.deleteMany();

		const allowedFoodTypes = Object.values(FoodType);

		const { email, phone, password, foodType } = req.body;

		if (!foodType.length) {
			return next(createCustomError('Food type is required', 400));
		}

		if (
			foodType.length > allowedFoodTypes.length ||
			foodType.some((type) => !allowedFoodTypes.includes(type))
		) {
			return next(
				createCustomError('Food type can be only veg or non-veg', 400)
			);
		}

		const existingVendor = await findVendor({ email, phone });

		if (existingVendor) {
			return next(
				createCustomError(
					'A vendor with this email or phone number already exists',
					302
				)
			);
		}

		const salt = await generateSalt();
		const hashedPassword = await generatePassword(password, salt);

		const createVendor = await Vendor.create({
			...req.body,
			salt,
			password: hashedPassword
		});

		return res.status(201).json(createVendor);
	}
);

export const getVendors = asyncWrapper(async (_, res) => {
	const vendors = await Vendor.find();

	if (!vendors.length) {
		return res.json({ message: 'No vendors found' });
	}

	return res.status(200).json(vendors);
});

export const getVendorById = asyncWrapper(async (req, res, next) => {
	const { id } = req.params as { id: string };

	const vendor = await findVendor({ id });

	if (!vendor) {
		return next(createCustomError('Vendor not found', 404));
	}

	return res.status(200).json(vendor);
});

export const findVendor = async ({ id, email, phone }: FindVendorOptions) => {
	return await Vendor.findOne({
		$or: [{ id }, { email }, { phone }]
	});
};
