import { Request, Response, NextFunction } from 'express';

export interface IRequest extends Request {}

export const asyncWrapper = (
	fn: (req: IRequest, res: Response, next: NextFunction) => Promise<any>
) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			await fn(req, res, next);
		} catch (error) {
			next(error);
		}
	};
};
