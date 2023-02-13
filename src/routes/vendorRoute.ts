import { Router } from 'express';
import {
	addFood,
	getCurrentOrders,
	getFoods,
	getOrderDetails,
	getVendorProfile,
	processOrder,
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

/* ------------------------ Order  routes ------------------------  */

router.route('/orders').get(getCurrentOrders);
router.route('/orders/:id').get(getOrderDetails);
router.route('/orders/:id/process').patch(processOrder);

export { router as vendorRoute };
