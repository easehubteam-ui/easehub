import { Request, Response } from 'express';
import { ExtraService } from '../services/service.service.js';
import { sendResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getServices = asyncHandler(async (req: Request, res: Response) => {
  const services = await ExtraService.getAll();
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Fetched Services',
    data: { services },
  });
});

export const getServiceById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const service = await ExtraService.getById(id);
  if (!service) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Service not found',
    });
  }
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Fetched Service',
    data: { service },
  });
});

export const createService = asyncHandler(async (req: Request, res: Response) => {
  const service = await ExtraService.create(req.body);
  return sendResponse({
    res,
    statusCode: 201,
    success: true,
    message: 'Service created successfully',
    data: { service },
  });
});

export const updateService = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const service = await ExtraService.update(id, req.body);
  if (!service) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Service not found',
    });
  }
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Service updated successfully',
    data: { service },
  });
});

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const deleted = await ExtraService.delete(id);
  if (!deleted) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Service not found',
    });
  }
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Service deleted successfully',
  });
});

export const updateServiceLocation = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { address, landmark, city, state, pincode, latitude, longitude } = req.body;

  const service = await ExtraService.update(id, {
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

  if (!service) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Service not found',
    });
  }

  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Service location updated successfully',
    data: { service },
  });
});
