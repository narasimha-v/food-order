import { Request, Response, Router } from 'express';
import { getIPAddress } from '../lib';
import { errorHandler, notFound } from '../middleware';

const router = Router();

router.get('/', (req: Request, res: Response, next) => {
	const ip = getIPAddress(req);
	return res.send(`Hello human, you are coming from ${ip}`);
});

router.use(errorHandler);
router.use(notFound);

export { router as api };
