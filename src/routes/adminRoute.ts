import { Router } from 'express';
import {
	createVendor,
	getDeliveryUserById,
	getDeliveryUsers,
	getTransactionById,
	getTransactions,
	getVendorById,
	getVendors,
	verifyDeliveryUser
} from '../controllers';

const router = Router();

router.route('/vendor').post(createVendor);

router.route('/vendor/:id').get(getVendorById);

router.route('/vendors').get(getVendors);

router.route('/transactions').get(getTransactions);

router.route('/transaction/:id').get(getTransactionById);

router.route('/delivery/users').get(getDeliveryUsers);

router.route('/delivery/user/:id').get(getDeliveryUserById);

router.route('/delivery-user/verify/:id').put(verifyDeliveryUser);

export { router as adminRoute };
