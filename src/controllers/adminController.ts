import { Request } from 'express';
import { CreateVendorInput } from '../dto';
import { asyncWrapper, createCustomError } from '../middleware';
import { Vendor } from '../models';
import { generatePassword, generateSalt } from '../utils';

export const createVendor = asyncWrapper(
	async (req: Request<any, any, CreateVendorInput>, res, next) => {
		await Vendor.deleteMany();

		const { email, phone, password } = req.body;

		const existingVendor = await Vendor.findOne({
			$or: [{ email }, { phone }]
		});

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

		return res.json(createVendor);
	}
);

export const getVendors = asyncWrapper((_, res) => {
	return;
});

export const getVendorById = asyncWrapper((req, res) => {
	return;
});
