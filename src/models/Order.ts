import { Document, model, Schema } from 'mongoose';
import { FoodDoc } from './Food';

export enum PaymentMethod {
	COD = 'COD',
	CARD = 'CARD'
}

export enum OrderStatus {
	WAITING = 'WAITING',
	FAILED = 'FAILED',
	ACCEPT = 'ACCEPT',
	REJECT = 'REJECT',
	UNDER_PROCESS = 'UNDER_PROCESS',
	READY = 'READY',
	DELIVERED = 'DELIVERED'
}

export interface CartItem {
	food: FoodDoc;
	quantity: number;
	amount: number;
}

export interface OrderDoc extends Document {
	orderId: string;
	vendorId: string;
	items: CartItem[];
	totalAmount: number;
	paidThrough: PaymentMethod;
	paymentResponse: string;
	orderStatus: OrderStatus;
	remarks: string;
	deliveryId: string;
	offerId: string;
	appliedOffer: boolean;
	readyTime: number;
	orderDate: Date;
	createdAt: Date;
	updatedAt: Date;
}

const OrderSchema = new Schema<OrderDoc>(
	{
		orderId: {
			type: String,
			required: true,
			unique: true
		},
		vendorId: {
			type: String,
			required: true
		},
		items: [
			{
				food: {
					type: Schema.Types.ObjectId,
					ref: 'Food',
					required: true
				},
				quantity: {
					type: Number,
					required: true
				},
				amount: {
					type: Number,
					required: true
				}
			}
		],
		totalAmount: {
			type: Number,
			required: true
		},
		paidThrough: {
			type: String,
			enum: Object.values(PaymentMethod)
		},
		paymentResponse: {
			type: String
		},
		orderStatus: {
			type: String,
			enum: Object.values(OrderStatus),
			default: OrderStatus.WAITING
		},
		orderDate: {
			type: Date
		},
		remarks: {
			type: String
		},
		deliveryId: {
			type: String
		},
		offerId: {
			type: String
		},
		appliedOffer: {
			type: Boolean
		},
		readyTime: {
			type: Number,
			default: 45
		}
	},
	{
		toJSON: {
			transform: (_, ret: Partial<OrderDoc>) => {
				delete ret.__v;
				delete ret.createdAt;
				delete ret.updatedAt;
			}
		},
		timestamps: true
	}
);

export const Order = model<OrderDoc>('Order', OrderSchema);
