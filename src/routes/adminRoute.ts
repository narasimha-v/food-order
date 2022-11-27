import { Router } from 'express';
import { createVendor, getVendors, getVendorById } from '../controllers';

const router = Router();

router.route('/vendor').post(createVendor);

router.route('/vendor/:id').get(getVendorById);

router.route('/vendors').get(getVendors);

export { router as adminRoute };
