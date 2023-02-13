import { Router } from 'express';
import {
	addToCart,
	createOrder,
	customerLogin,
	customerSignup,
	editCustomerProfile,
	getCart,
	getCustomerProfile,
	getOrderById,
	getOrders,
	clearCart,
	requestOtp,
	verifyCustomer
} from '../controllers';
import { verifySignature } from '../middleware';

const router = Router();

/** ------------------- AUTHENTICATION ------------------- **/

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

/** ------------------- CART ------------------- **/

router.route('/cart').get(getCart).post(addToCart).delete(clearCart);

/** ------------------- ORDERS ------------------- **/

router.route('/create-order').post(createOrder);

router.route('/orders').get(getOrders);

router.route('/order/:id').get(getOrderById);

export { router as customerRoute };
