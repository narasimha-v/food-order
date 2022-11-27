import { NextFunction, Request } from 'express';
import { EditVendorInput, VendorLoginInput } from '../dto';
import {
	asyncWrapper,
	createCustomError,
	generateSignature
} from '../middleware';
import { VendorDoc } from '../models';
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

	if (name) vendor.name = name;
	if (phone) vendor.phone = phone;
	if (address) vendor.address = address;
	if (foodType) vendor.foodType = foodType;
};
