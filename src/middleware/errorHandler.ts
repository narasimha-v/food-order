import { CustomAPIError } from './customError';
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
	err: Error,
	_: Request,
	res: Response,
	__: NextFunction
) => {
	if (err instanceof CustomAPIError) {
		return res
			.status(err.statusCode)
			.json(err.json ? err.json : { msg: err.message });
	}
	return res
		.status(500)
		.json({ msg: 'Something went wrong, please try again', error: err });
};
