import { Document, model, Schema, SchemaTypes } from 'mongoose';
import { CreateVendorInput, FoodType } from '../dto';
import { FoodDoc } from './Food';

export interface VendorDoc extends CreateVendorInput, Document {
	salt: string;
	serviceAvailable: boolean;
	coverImages: String[];
	rating: number;
	foods: FoodDoc[];
	lat: number;
	lng: number;
	createdAt: Date;
	updatedAt: Date;
}

const VendorSchema = new Schema<VendorDoc>(
	{
		name: {
			type: String,
			required: true,
			maxlength: 200
		},
		ownerName: {
			type: String,
			required: true,
			maxlength: 200
		},
		foodType: {
			type: [String],
			enum: Object.values(FoodType)
		},
		address: {
			type: String,
			maxlength: 1000
		},
		pincode: {
			type: String,
			required: true,
			maxlength: 6
		},
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
		salt: {
			type: String,
			required: true
		},
		serviceAvailable: {
			type: Boolean,
			default: false
		},
		coverImages: {
			type: [String],
			default: []
		},
		rating: {
			type: Number,
			default: 0
		},
		foods: [
			{
				type: SchemaTypes.ObjectId,
				ref: 'Food'
			}
		],
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
			transform: (_, ret: Partial<VendorDoc>) => {
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

export const Vendor = model<VendorDoc>('Vendor', VendorSchema);
