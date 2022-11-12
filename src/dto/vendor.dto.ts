export enum FoodType {
	'veg' = 'veg',
	'non-veg' = 'non-veg',
	'veg/non-veg' = 'veg/non-veg'
}

export interface CreateVendorInput {
	name: string;
	ownerName: string;
	foodType: FoodType;
	address: string;
	pincode: string;
	phone: string;
	email: string;
	password: string;
}
