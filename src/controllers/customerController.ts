import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCustomerInput, FindCustomerOptions } from '../dto';
import {
	asyncWrapper,
	createCustomError,
	generateSignature
} from '../middleware';
import { Customer } from '../models';
import {
	generateSalt,
	generatePassword,
	generateOtp,
	onRequestOtp
} from '../utils';

export const customerSignup = asyncWrapper(async (req, res, next) => {
	const customerInputs = plainToClass(CreateCustomerInput, req.body);
	const errors = await validate(customerInputs, {
		validationError: { target: true }
	});

	if (errors.length > 0) {
		return next(createCustomError('Input validation errors', 400, errors));
	}

	const { password, phone } = customerInputs;

	const isExistingCustomer = await findCustomer(customerInputs);

	if (isExistingCustomer) {
		return next(createCustomError('Customer already exists', 400));
	}

	const salt = await generateSalt();
	const hashedPassword = await generatePassword(password, salt);
	const { otp, expiry } = generateOtp();

	const createCustomer = await Customer.create({
		...customerInputs,
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
});

export const customerLogin = asyncWrapper(async (req, res, next) => {});

export const verifyCustomer = asyncWrapper(async (req, res, next) => {});

export const requestOtp = asyncWrapper(async (req, res, next) => {});

export const getCustomerProfile = asyncWrapper(async (req, res, next) => {});

export const editCustomerProfile = asyncWrapper(async (req, res, next) => {});

export const findCustomer = async ({
	id,
	email,
	phone
}: FindCustomerOptions) => {
	if (id) {
		return await Customer.findById(id);
	}

	return await Customer.findOne({
		$or: [{ email }, { phone }]
	});
};
