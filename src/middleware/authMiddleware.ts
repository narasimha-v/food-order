import { NextFunction, Request, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { AuthPayload, VendorPayload } from '../dto';
import { createCustomError } from './customError';

export const generateSignature = (payload: VendorPayload) => {
	const signature = sign(payload, process.env.APP_SECRET!, {
		expiresIn: '1d'
	});
	return signature;
};

export const verifySignature = (
	req: Request,
	_: Response,
	next: NextFunction
) => {
	const signature = req.get('Authorization');
	if (!signature) {
		return next(createCustomError('Unauthorized', 401));
	}
	try {
		const validToken = verify(signature.split(' ')[1], process.env.APP_SECRET!);
		req.user = validToken as AuthPayload;
		if (validToken) return next();
	} catch (error) {
		return next(createCustomError('Unauthorized', 401));
	}
};
