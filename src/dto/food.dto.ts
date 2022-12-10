import { FoodType } from './vendor.dto';

export enum FoodCategory {
	Breakfast = 'breakfast',
	Lunch = 'lunch',
	Dinner = 'dinner',
	Snacks = 'snacks'
}

export interface CreateFoodInput {
	name: string;
	description: string;
	category: FoodCategory;
	foodType: FoodType;
	readyTime: number;
	price: number;
}
