import { VendorDoc } from '../models';

export enum FoodType {
	VEG = 'veg',
	NON_VEG = 'non-veg'
}

export enum OfferType {
	VENDOR = 'VENDOR',
	GENERIC = 'GENERIC'
}

export enum PromoType {
	USER = 'USER',
	BANK = 'BANK',
	CARD = 'CARD',
	ALL = 'ALL'
}

export interface CreateVendorInput {
	name: string;
	ownerName: string;
	foodType: FoodType[];
	address: string;
	pincode: string;
	phone: string;
	email: string;
	password: string;
}

export interface EditVendorInput {
	name?: string;
	phone?: string;
	address?: string;
	foodType?: FoodType[];
}

export interface VendorLoginInput {
	email: string;
	password: string;
}

export interface VendorPayload {
	_id: string;
	name: string;
	email: string;
	foodType: FoodType[];
}

export interface FindVendorOptions {
	id?: string;
	phone?: string;
	email?: string;
}

export interface CreateOfferInput {
	offerType: OfferType;
	vendors: VendorDoc[];
	title: string;
	description: string;
	minValue: number;
	offerAmount: number;
	startValidity: Date;
	endValidity: Date;
	promoCode: string;
	promoType: PromoType;
	bank: string[];
	bins: number[];
	pincode: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}
