import { Request, Response } from 'express';
import { LaundryService } from '../services/laundry.service.js';
import { sendResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getLaundryProviders = asyncHandler(async (req: Request, res: Response) => {
  const providers = await LaundryService.getAll();
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Fetched Laundry Providers successfully',
    data: { providers },
  });
});

export const getLaundryProviderById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const provider = await LaundryService.getById(id);
  if (!provider) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Laundry provider not found',
    });
  }
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Fetched Laundry Provider details',
    data: { provider },
  });
});

export const createLaundryProvider = asyncHandler(async (req: Request, res: Response) => {
  const provider = await LaundryService.create(req.body);
  return sendResponse({
    res,
    statusCode: 201,
    success: true,
    message: 'Laundry Provider created successfully',
    data: { provider },
  });
});

export const updateLaundryProvider = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const provider = await LaundryService.update(id, req.body);
  if (!provider) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Laundry Provider not found',
    });
  }
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Laundry Provider updated successfully',
    data: { provider },
  });
});

export const deleteLaundryProvider = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const deleted = await LaundryService.delete(id);
  if (!deleted) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Laundry Provider not found',
    });
  }
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Laundry Provider deleted successfully',
  });
});
