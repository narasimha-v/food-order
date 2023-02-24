import { Router } from 'express';
import {
	addFood,
	addOffer,
	editOffer,
	getCurrentOrders,
	getFoods,
	getOffers,
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

/* ------------------------ Orders ------------------------  */

router.route('/orders').get(getCurrentOrders);
router.route('/orders/:id').get(getOrderDetails);
router.route('/orders/:id/process').patch(processOrder);

/* ------------------------ Offers ------------------------  */
router.route('/offers').get(getOffers);
router.route('/offer').post(addOffer);
router.route('/offer/:id').patch(editOffer);

export { router as vendorRoute };
