import { Length } from 'class-validator';
import { CreateCustomerInput } from './customer.dto';

export class CreateDeliveryUserInput extends CreateCustomerInput {
	@Length(3, 16)
	firstName: string;

	@Length(3, 16)
	lastName: string;

	@Length(6, 24)
	address: string;

	@Length(4, 12)
	pincode: string;
}

export interface FindDeliveryUserOptions {
	id?: string;
	phone?: string;
	email?: string;
}
