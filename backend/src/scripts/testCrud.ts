import mongoose from 'mongoose';
import { env } from '../config/env.js';
import app from '../app.js';
import http from 'http';
import { PG } from '../models/PG.js';
import { MealProvider } from '../models/MealProvider.js';
import { LaundryProvider } from '../models/LaundryProvider.js';
import { Service } from '../models/Service.js';

const startServer = () => {
  return new Promise<http.Server>((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
};

const runTest = async () => {
  console.log('=== STARTING EASEHUB MONGODB CRUD & GET API INTEGRATION TEST ===\n');

  // 1. Connect MongoDB
  await mongoose.connect(env.MONGO_URI);
  console.log('1. Connected to MongoDB database:', mongoose.connection.name);

  // Start temporary test HTTP server
  const server = await startServer();
  const address = server.address() as any;
  const baseUrl = `http://localhost:${address.port}`;
  console.log(`2. Test HTTP server running at ${baseUrl}`);

  // 2. Admin Login
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@easehub.local',
      password: 'EaseHub@2026!Admin',
    }),
  });

  const loginData: any = await loginRes.json();
  if (!loginData.success || !loginData.data?.token) {
    console.error('Failed to log in as admin:', loginData);
    process.exit(1);
  }

  const token = loginData.data.token;
  console.log('3. Admin authentication successful. JWT Token obtained.');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // --- 4. TEST PG ---
  console.log('\n--- PG TEST ---');
  const pgPayload = {
    name: 'Green Heights PG & Hostel',
    gender: 'BOYS',
    landlordName: 'Ramesh Sharma',
    landlordPhone: '9876543210',
    monthlyRent: 4500,
    deposit: 5000,
    corridor: 'Junwani Road',
    distance: '300m from BIT Gate',
    amenities: ['Wi-Fi', 'Power Backup', '3 Times Meals', 'CCTV Security'],
    city: 'Bhilai',
    landmark: 'Near BIT Gate 2',
    photos: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'],
  };

  const createPgRes = await fetch(`${baseUrl}/api/pg`, {
    method: 'POST',
    headers,
    body: JSON.stringify(pgPayload),
  });
  const createPgData: any = await createPgRes.json();
  console.log('Admin POST /api/pg status:', createPgRes.status, createPgData.message);
  const createdPgId = createPgData.data?.pg?._id;
  console.log('Created PG Mongo ID:', createdPgId);

  // GET /api/pg
  const getPgRes = await fetch(`${baseUrl}/api/pg`);
  const getPgData: any = await getPgRes.json();
  console.log('Customer GET /api/pg status:', getPgRes.status, `Total PGs found: ${getPgData.data?.pgs?.length}`);
  const fetchedPg = getPgData.data?.pgs?.find((p: any) => p._id === createdPgId);
  console.log('Verified Created PG in Customer GET Response:', fetchedPg ? `SUCCESS (${fetchedPg.name})` : 'FAILED');

  // Verify in MongoDB directly
  const mongoPg = await PG.findById(createdPgId);
  console.log('Verified directly in MongoDB PG collection:', mongoPg ? `SUCCESS (code: ${mongoPg.code})` : 'FAILED');


  // --- 5. TEST MEALS ---
  console.log('\n--- MEAL PROVIDER TEST ---');
  const mealPayload = {
    name: 'Annapurna Tiffin & Mess',
    fssai: 'FSSAI-123456789012',
    corridor: 'Civic Center',
    distance: '500m from BIT Campus',
    dailyPrice: 80,
    monthlyPrice: 2400,
    activeTiffins: 60,
    breakfastMenu: 'Poha, Upma, Tea',
    lunchMenu: '4 Roti, Dal Fry, Seasonal Sabzi, Jeera Rice, Salad',
    dinnerMenu: '4 Roti, Special Dal, Paneer Sabzi, Rice, Gulab Jamun',
    isVeg: true,
    city: 'Bhilai',
    landmark: 'Civic Center Market',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
  };

  const createMealRes = await fetch(`${baseUrl}/api/meals`, {
    method: 'POST',
    headers,
    body: JSON.stringify(mealPayload),
  });
  const createMealData: any = await createMealRes.json();
  console.log('Admin POST /api/meals status:', createMealRes.status, createMealData.message);
  const createdMealId = createMealData.data?.mealProvider?._id || createMealData.data?.provider?._id;
  console.log('Created Meal Mongo ID:', createdMealId);

  // GET /api/meals
  const getMealsRes = await fetch(`${baseUrl}/api/meals`);
  const getMealsData: any = await getMealsRes.json();
  const mealList = getMealsData.data?.providers || getMealsData.data?.mealProviders || getMealsData.data?.meals;
  console.log('Customer GET /api/meals status:', getMealsRes.status, `Total Meal Providers found: ${mealList?.length}`);
  const fetchedMeal = mealList?.find((m: any) => m._id === createdMealId);
  console.log('Verified Created Meal Provider in Customer GET Response:', fetchedMeal ? `SUCCESS (${fetchedMeal.name})` : 'FAILED');

  // Verify in MongoDB directly
  const mongoMeal = await MealProvider.findById(createdMealId);
  console.log('Verified directly in MongoDB MealProvider collection:', mongoMeal ? `SUCCESS (code: ${mongoMeal.code})` : 'FAILED');


  // --- 6. TEST LAUNDRY ---
  console.log('\n--- LAUNDRY PROVIDER TEST ---');
  const laundryPayload = {
    name: 'Sparkle Express Laundry Services',
    ownerName: 'Suresh Verma',
    phone: '9826123456',
    email: 'sparkle@easehub.local',
    description: 'Same day eco-friendly laundry & dry cleaning',
    pricePerKg: 45,
    steamIronPerPc: 10,
    turnaroundHours: 24,
    corridor: 'Smriti Nagar',
    city: 'Bhilai',
    landmark: 'Near Surya Mall',
    photos: ['https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800'],
    servicesOffered: ['Wash & Fold', 'Wash & Steam Iron', 'Dry Cleaning'],
  };

  const createLaundryRes = await fetch(`${baseUrl}/api/laundry`, {
    method: 'POST',
    headers,
    body: JSON.stringify(laundryPayload),
  });
  const createLaundryData: any = await createLaundryRes.json();
  console.log('Admin POST /api/laundry status:', createLaundryRes.status, createLaundryData.message);
  const createdLaundryId = createLaundryData.data?.laundryProvider?._id || createLaundryData.data?.provider?._id;
  console.log('Created Laundry Mongo ID:', createdLaundryId);

  // GET /api/laundry
  const getLaundryRes = await fetch(`${baseUrl}/api/laundry`);
  const getLaundryData: any = await getLaundryRes.json();
  const laundryList = getLaundryData.data?.providers || getLaundryData.data?.laundryProviders || getLaundryData.data?.laundry;
  console.log('Customer GET /api/laundry status:', getLaundryRes.status, `Total Laundry Providers found: ${laundryList?.length}`);
  const fetchedLaundry = laundryList?.find((l: any) => l._id === createdLaundryId);
  console.log('Verified Created Laundry Provider in Customer GET Response:', fetchedLaundry ? `SUCCESS (${fetchedLaundry.name})` : 'FAILED');

  // Verify in MongoDB directly
  const mongoLaundry = await LaundryProvider.findById(createdLaundryId);
  console.log('Verified directly in MongoDB LaundryProvider collection:', mongoLaundry ? `SUCCESS (code: ${mongoLaundry.code})` : 'FAILED');


  // --- 7. TEST SERVICES ---
  console.log('\n--- SERVICE TEST ---');
  const servicePayload = {
    name: 'Deep Room & Hostel Cleaning',
    slug: 'deep-room-cleaning',
    category: 'CLEANING',
    description: 'Complete room sanitization, floor scrubbing, bathroom deep cleaning.',
    basePrice: 499,
    priceUnit: 'per session',
    providerName: 'CleanPro Bhilai',
    providerPhone: '9988776655',
    corridor: 'Junwani',
    city: 'Bhilai',
    photos: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'],
  };

  const createServiceRes = await fetch(`${baseUrl}/api/services`, {
    method: 'POST',
    headers,
    body: JSON.stringify(servicePayload),
  });
  const createServiceData: any = await createServiceRes.json();
  console.log('Admin POST /api/services status:', createServiceRes.status, createServiceData.message);
  const createdServiceId = createServiceData.data?.service?._id;
  console.log('Created Service Mongo ID:', createdServiceId);

  // GET /api/services
  const getServicesRes = await fetch(`${baseUrl}/api/services`);
  const getServicesData: any = await getServicesRes.json();
  const servicesList = getServicesData.data?.services;
  console.log('Customer GET /api/services status:', getServicesRes.status, `Total Services found: ${servicesList?.length}`);
  const fetchedService = servicesList?.find((s: any) => s._id === createdServiceId);
  console.log('Verified Created Service in Customer GET Response:', fetchedService ? `SUCCESS (${fetchedService.name})` : 'FAILED');

  // Verify in MongoDB directly
  const mongoService = await Service.findById(createdServiceId);
  console.log('Verified directly in MongoDB Service collection:', mongoService ? `SUCCESS (slug: ${mongoService.slug})` : 'FAILED');

  // Clean up
  server.close();
  await mongoose.disconnect();
  console.log('\n=== ALL EASEHUB MONGODB API INTEGRATION TESTS COMPLETED SUCCESSFULLY ===');
};

runTest().catch((err) => {
  console.error('Test Execution Failed:', err);
  process.exit(1);
});
