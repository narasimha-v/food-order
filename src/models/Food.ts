import { Document, model, Schema } from 'mongoose';
import { CreateFoodInput, FoodCategory, FoodType } from '../dto';

export interface FoodDoc extends CreateFoodInput, Document {
	vendorId: string;
	rating: number;
	images: [String];
	createdAt: Date;
	updatedAt: Date;
}

const FoodSchema = new Schema<FoodDoc>(
	{
		vendorId: {
			type: String
		},
		name: {
			type: String,
			required: true
		},
		description: {
			type: String,
			required: true
		},
		category: {
			type: String,
			enum: Object.values(FoodCategory),
			required: true
		},
		foodType: {
			type: String,
			enum: Object.values(FoodType),
			required: true
		},
		price: {
			type: Number,
			required: true
		},
		readyTime: {
			type: Number
		},
		rating: {
			type: Number,
			default: 0
		},
		images: {
			type: [String],
			default: []
		}
	},
	{
		toJSON: {
			transform: (_, ret: Partial<FoodDoc>) => {
				delete ret.__v;
				delete ret.createdAt;
				delete ret.updatedAt;
			}
		},
		timestamps: true
	}
);

export const Food = model<FoodDoc>('Food', FoodSchema);
