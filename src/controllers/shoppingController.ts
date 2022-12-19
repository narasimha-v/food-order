import { asyncWrapper, createCustomError } from '../middleware';
import { FoodDoc, Vendor } from '../models';

export const getFoodAvailability = asyncWrapper(async (req, res, next) => {
	const pincode = req.params.pincode;
	const restaurants = await Vendor.find({
		pincode,
		serviceAvailable: true
	})
		.sort([['rating', 'descending']])
		.populate('foods');

	if (!restaurants.length) {
		return next(
			createCustomError('No service available in your area currently', 404)
		);
	}

	return res.status(200).json(restaurants);
});

export const getTopRestaurants = asyncWrapper(async (req, res, next) => {
	const pincode = req.params.pincode;
	const restaurants = await Vendor.find({
		pincode,
		serviceAvailable: true
	})
		.sort([['rating', 'descending']])
		.limit(10);

	if (!restaurants.length) {
		return next(
			createCustomError('No service available in your area currently', 404)
		);
	}

	return res.status(200).json(restaurants);
});

export const getFoodsinUnder30Min = asyncWrapper(async (req, res, next) => {
	const pincode = req.params.pincode;
	const restaurants = await Vendor.find({
		pincode,
		serviceAvailable: true
	}).populate('foods');

	if (!restaurants.length) {
		return next(
			createCustomError('No service available in your area currently', 404)
		);
	}

	let foods: FoodDoc[] = [];
	restaurants.forEach((restaurant) => {
		const food = restaurant.foods.filter((food) => food.readyTime <= 30);
		foods = [...foods, ...food];
	});

	return res.status(200).json(foods);
});

export const searchFoods = asyncWrapper(async (req, res, next) => {
	const pincode = req.params.pincode;
	const restaurants = await Vendor.find({
		pincode,
		serviceAvailable: true
	}).populate('foods');

	if (!restaurants.length) {
		return next(
			createCustomError('No service available in your area currently', 404)
		);
	}

	let foods = restaurants.map((restaurant) => restaurant.foods).flat();
	return res.status(200).json(foods);
});

export const getRestaurantById = asyncWrapper(async (req, res, next) => {
	const id = req.params.id;
	const restaurant = await Vendor.findById(id).populate('foods');
	if (!restaurant) {
		return next(createCustomError('Restaurant not found', 404));
	}
	return res.status(200).json(restaurant);
});
