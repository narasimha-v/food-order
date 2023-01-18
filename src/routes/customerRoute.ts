import { Router } from 'express';
import {
	customerLogin,
	customerSignup,
	editCustomerProfile,
	getCustomerProfile,
	requestOtp,
	verifyCustomer
} from '../controllers';
import { verifySignature } from '../middleware';

const router = Router();

/** ------------------- Signup / Create customer ------------------- **/
router.route('/signup').post(customerSignup);

/** ------------------- Login customer ------------------- **/
router.route('/login').post(customerLogin);

router.use(verifySignature);

/** ------------------- Verify customer account ------------------- **/
router.route('/verify').patch(verifyCustomer);

/** ------------------- OTP / Requesting OTP ------------------- **/
router.route('/otp').get(requestOtp);

/** ------------------- Profile ------------------- **/
router.route('/profile').get(getCustomerProfile).patch(editCustomerProfile);

export { router as customerRoute };
