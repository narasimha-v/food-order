import { Router } from 'express';
import multer from 'multer';
import {
	addFood,
	getFoods,
	getVendorProfile,
	updateVendorProfile,
	updateVendorService,
	vendorLogin
} from '../controllers';
import { verifySignature } from '../middleware';
import { uploadImagesHandler } from '../utils';

const router = Router();

router.route('/login').post(vendorLogin);

router.use(verifySignature);

router
	.route('/profile')
	.get(getVendorProfile)
	.patch(uploadImagesHandler, updateVendorProfile);

router.route('/service').patch(updateVendorService);

router.route('/food').post(uploadImagesHandler, addFood);

router.route('/foods').get(getFoods);

export { router as vendorRoute };
