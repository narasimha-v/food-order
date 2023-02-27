import { IsEmail, Length } from 'class-validator';
import { OrderStatus, PaymentMethod } from '../models';

export class CreateCustomerInput {
	@IsEmail()
	email: string;

	@Length(8, 20)
	password: string;

	@Length(8, 14)
	phone: string;
}

export class CustomerLoginInput {
	@IsEmail()
	email: string;

	@Length(8, 20)
	password: string;
}

export class EditCustomerProfileInput {
	@Length(3, 16)
	firstName: string;

	@Length(3, 16)
	lastName: string;

	@Length(6, 16)
	address: string;
}

export interface FindCustomerOptions {
	id?: string;
	phone?: string;
	email?: string;
}

export interface CustomerPayload {
	_id: string;
	email: string;
	verified: boolean;
}

export interface CartItem {
	_id: string;
	quantity: number;
}

export interface OrderInput {
	txnId: string;
	amount: number;
	items: CartItem[];
}

export interface ProcessOrder {
	orderStatus: OrderStatus;
	remarks: string;
	time?: number;
}

export interface createPaymentInput {
	amount: number;
	paymentMethod: PaymentMethod;
	offerId?: string;
}
