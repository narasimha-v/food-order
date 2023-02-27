import { Document, model, Schema } from 'mongoose';
import { CustomerDoc } from './Customer';

export enum PaymentMethod {
	COD = 'COD',
	CARD = 'CARD'
}

export enum PaymentStatus {
	OPEN = 'OPEN',
	CONFIRMED = 'CONFIRMED',
	SUCCESS = 'SUCCESS',
	FAILED = 'FAILED'
}

export interface TransactionDoc extends Document {
	customer: CustomerDoc;
	vendorId: string;
	orderId: string;
	offerUsed: string;
	orderValue: number;
	paymentMode: PaymentMethod;
	paymentResponse: string;
	status: string;
	createdAt: Date;
	updatedAt: Date;
}

const TransactionSchema = new Schema<TransactionDoc>(
	{
		customer: {
			type: Schema.Types.ObjectId,
			ref: 'Customer'
		},
		vendorId: String,
		orderId: String,
		offerUsed: String,
		orderValue: Number,
		paymentMode: {
			type: String,
			enum: Object.values(PaymentMethod)
		},
		paymentResponse: String,
		status: {
			type: String,
			enum: Object.values(PaymentStatus)
		}
	},
	{
		toJSON: {
			transform: (_, ret: Partial<TransactionDoc>) => {
				delete ret.__v;
				delete ret.createdAt;
				delete ret.updatedAt;
			}
		},
		timestamps: true
	}
);

export const Transaction = model<TransactionDoc>(
	'Transaction',
	TransactionSchema
);
