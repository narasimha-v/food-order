import { Router } from 'express';
import {
	getFoodAvailability,
	getFoodsinUnder30Min,
	getRestaurantById,
	getTopRestaurants,
	searchFoods
} from '../controllers';

const router = Router();

/** ------------------- Food availability ------------------- **/
router.route('/:pincode').get(getFoodAvailability);

/** ------------------- Top restaurants ------------------- **/
router.route('/top-restaurants/:pincode').get(getTopRestaurants);

/** ------------------- Foods available in 30 minutes ------------------- **/
router.route('/foods-in-under-thirty-min/:pincode').get(getFoodsinUnder30Min);

/** ------------------- Search foods ------------------- **/
router.route('/search/:pincode').get(searchFoods);

/** ------------------- Find restaurant by ID ------------------- **/
router.route('/restaurant/:id').get(getRestaurantById);

export { router as shoppingRoute };
