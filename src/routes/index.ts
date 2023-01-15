import { Request, Response, Router } from 'express';
import { errorHandler, notFound } from '../middleware';
import { getIPAddress } from '../utils';
import { adminRoute } from './adminRoute';
import { customerRoute } from './customerRoute';
import { shoppingRoute } from './shoppingRoute';
import { vendorRoute } from './vendorRoute';

const router = Router();

router.get('/', (req: Request, res: Response) => {
	const ip = getIPAddress(req);
	return res.send(`Hello human, you are coming from ${ip}`);
});

router.use('/admin', adminRoute);
router.use('/vendor', vendorRoute);
router.use('/customer', customerRoute);
router.use(shoppingRoute);
router.use(errorHandler);
router.use(notFound);

export { router as api };
