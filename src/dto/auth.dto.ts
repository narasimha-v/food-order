import { CustomerPayload } from './customer.dto';
import { VendorPayload } from './vendor.dto';

export type AuthPayload = VendorPayload | CustomerPayload;
