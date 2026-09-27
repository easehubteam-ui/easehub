import { Request, Response } from 'express';
import { MealService } from '../services/meal.service.js';
import { sendResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMealProviders = asyncHandler(async (req: Request, res: Response) => {
  const providers = await MealService.getAll();
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Fetched Meal Providers',
    data: { providers },
  });
});

export const getMealProviderById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const provider = await MealService.getById(id);
  if (!provider) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Meal Provider not found',
    });
  }
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Fetched Meal Provider',
    data: { provider },
  });
});

export const createMealProvider = asyncHandler(async (req: Request, res: Response) => {
  const provider = await MealService.create(req.body);
  return sendResponse({
    res,
    statusCode: 201,
    success: true,
    message: 'Meal Provider created successfully',
    data: { provider },
  });
});

export const updateMealProvider = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const provider = await MealService.update(id, req.body);
  if (!provider) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Meal Provider not found',
    });
  }
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Meal Provider updated successfully',
    data: { provider },
  });
});

export const deleteMealProvider = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const deleted = await MealService.delete(id);
  if (!deleted) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Meal Provider not found',
    });
  }
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Meal Provider deleted successfully',
  });
});

export const updateMealProviderLocation = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { address, landmark, city, state, pincode, latitude, longitude } = req.body;

  const provider = await MealService.update(id, {
    location: {
      address,
      landmark,
      city,
      state,
      pincode,
      latitude,
      longitude,
    },
  });

  if (!provider) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Meal Provider not found',
    });
  }

  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Meal Provider location updated successfully',
    data: { provider },
  });
});
