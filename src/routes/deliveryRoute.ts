import { Router } from 'express';
import {
	deliveryUserLogin,
	deliveryUserSignup,
	editDeliveryUserProfile,
	getDeliveryUserProfile
} from '../controllers';
import { verifySignature } from '../middleware';

const router = Router();
/** ------------------- Signup / Create delivery ------------------- **/
router.route('/signup').post(deliveryUserSignup);

/** ------------------- Login customer ------------------- **/
router.route('/login').post(deliveryUserLogin);

router.use(verifySignature);

/** ------------------- Profile ------------------- **/
router
	.route('/profile')
	.get(getDeliveryUserProfile)
	.patch(editDeliveryUserProfile);

/** ------------------- Change service status ------------------- **/
router.route('/change-status').put();

export { router as deliveryRoute };
