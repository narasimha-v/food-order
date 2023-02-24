import { Document, model, Schema } from 'mongoose';
import { CreateOfferInput, OfferType, PromoType } from '../dto';

export interface OfferDoc extends Document, CreateOfferInput {}

const OfferSchema = new Schema<OfferDoc>(
	{
		offerType: {
			type: String,
			enum: Object.values(OfferType)
		},
		vendors: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Vendor'
			}
		],
		title: {
			type: String,
			required: true
		},
		description: String,
		minValue: {
			type: Number,
			required: true
		},
		offerAmount: {
			type: Number,
			required: true
		},
		startValidity: Date,
		endValidity: Date,
		promoCode: {
			type: String,
			required: true
		},
		promoType: {
			type: String,
			enum: Object.values(PromoType)
		},
		bank: [String],
		bins: [Number],
		pincode: {
			type: String,
			required: true
		},
		isActive: Boolean
	},
	{
		toJSON: {
			transform: (_, ret: Partial<OfferDoc>) => {
				delete ret.__v;
				delete ret.createdAt;
				delete ret.updatedAt;
			}
		},
		timestamps: true
	}
);

export const Offer = model<OfferDoc>('Offer', OfferSchema);
