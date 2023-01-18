import { Document, model, Schema } from 'mongoose';
import { CreateCustomerInput, EditCustomerProfileInput } from '../dto';

export interface CustomerDoc
	extends CreateCustomerInput,
		EditCustomerProfileInput,
		Document {
	otp?: number;
	lat: number;
	lng: number;
	salt: string;
	verified: boolean;
	otpExpiry?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const CustomerSchema = new Schema<CustomerDoc>(
	{
		email: {
			type: String,
			required: true
		},
		phone: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		address: {
			type: String
		},
		firstName: {
			type: String
		},
		lastName: {
			type: String
		},
		verified: {
			type: Boolean,
			required: true,
			default: false
		},
		otp: {
			type: Number
		},
		otpExpiry: {
			type: Date
		},
		salt: {
			type: String,
			required: true
		},
		lat: {
			type: Number,
			default: 0
		},
		lng: {
			type: Number,
			default: 0
		}
	},
	{
		toJSON: {
			transform: (_, ret: Partial<CustomerDoc>) => {
				delete ret.password;
				delete ret.salt;
				delete ret.otp;
				delete ret.otpExpiry;
				delete ret.__v;
				delete ret.createdAt;
				delete ret.updatedAt;
			}
		},
		timestamps: true
	}
);

export const Customer = model<CustomerDoc>('Customer', CustomerSchema);
