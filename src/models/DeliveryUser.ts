import { Document, model, Schema } from 'mongoose';
import { CreateDeliveryUserInput } from '../dto';

export interface DeliveryUserDoc extends CreateDeliveryUserInput, Document {
	lat: number;
	lng: number;
	salt: string;
	verified: boolean;
	isAvailable: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const DeliveryUserSchema = new Schema<DeliveryUserDoc>(
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
			type: String,
			required: true
		},
		pincode: {
			type: String,
			required: true
		},
		firstName: {
			type: String
		},
		lastName: {
			type: String
		},
		salt: {
			type: String,
			required: true
		},
		verified: {
			type: Boolean,
			default: false
		},
		lat: {
			type: Number,
			default: 0
		},
		lng: {
			type: Number,
			default: 0
		},
		isAvailable: {
			type: Boolean,
			default: false
		}
	},
	{
		toJSON: {
			transform: (_, ret: Partial<DeliveryUserDoc>) => {
				delete ret.password;
				delete ret.salt;
				delete ret.__v;
				delete ret.createdAt;
				delete ret.updatedAt;
			}
		},
		timestamps: true
	}
);

export const DeliveryUser = model<DeliveryUserDoc>(
	'DeliveryUser',
	DeliveryUserSchema
);
