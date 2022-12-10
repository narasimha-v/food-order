import { Router } from 'express';
import {
	addFood,
	getFoods,
	getVendorProfile,
	updateVendorProfile,
	updateVendorService,
	vendorLogin
} from '../controllers';
import { verifySignature } from '../middleware';

const router = Router();

router.route('/login').post(vendorLogin);

router.use(verifySignature);

router.route('/profile').get(getVendorProfile).patch(updateVendorProfile);

router.route('/service').patch(updateVendorService);

router.route('/food').post(addFood);

router.route('/foods').get(getFoods);

export { router as vendorRoute };
