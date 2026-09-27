import { Request, Response } from 'express';
import { PGService } from '../services/pg.service.js';
import { sendResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPGs = asyncHandler(async (req: Request, res: Response) => {
  const pgs = await PGService.getAll();
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Fetched PG properties',
    data: { pgs },
  });
});

export const getPGById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const pg = await PGService.getById(id);
  if (!pg) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'PG Property not found',
    });
  }
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Fetched PG property',
    data: { pg },
  });
});

export const createPG = asyncHandler(async (req: Request, res: Response) => {
  const pg = await PGService.create(req.body);
  return sendResponse({
    res,
    statusCode: 201,
    success: true,
    message: 'PG created successfully',
    data: { pg },
  });
});

export const updatePG = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const pg = await PGService.update(id, req.body);
  if (!pg) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'PG Property not found',
    });
  }
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'PG Property updated successfully',
    data: { pg },
  });
});

export const deletePG = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const deleted = await PGService.delete(id);
  if (!deleted) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'PG Property not found',
    });
  }
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'PG Property deleted successfully',
  });
});

export const updatePGLocation = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { address, landmark, city, state, pincode, latitude, longitude } = req.body;

  const updateData = {
    location: {
      address,
      landmark,
      city,
      state,
      pincode,
      latitude,
      longitude,
    },
  };

  const pg = await PGService.update(id, updateData);

  if (!pg) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'PG Property not found',
    });
  }

  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'PG location updated successfully',
    data: { pg },
  });
});
