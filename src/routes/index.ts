import { Request, Response, Router } from 'express';
import { getIPAddress } from '../lib';
import { errorHandler, notFound } from '../middleware';
import { adminRoute } from './adminRoute';
import { shoppingRoute } from './shoppingRoute';
import { vendorRoute } from './vendorRoute';

const router = Router();

router.get('/', (req: Request, res: Response) => {
	const ip = getIPAddress(req);
	return res.send(`Hello human, you are coming from ${ip}`);
});

router.use('/admin', adminRoute);
router.use('/vendor', vendorRoute);
router.use(shoppingRoute);
router.use(errorHandler);
router.use(notFound);

export { router as api };
