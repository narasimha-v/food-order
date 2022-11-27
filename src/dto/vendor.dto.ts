export enum FoodType {
	VEG = 'veg',
	NON_VEG = 'non-veg'
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
