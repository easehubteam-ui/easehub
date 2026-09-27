import mongoose from 'mongoose';
import { env } from '../config/env.js';

const checkDb = async () => {
  console.log('--- MongoDB Diagnostics ---');
  console.log('MONGO_URI Configured:', env.MONGO_URI);
  
  try {
    const conn = await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB Connection Status: SUCCESS');
    console.log('Host:', conn.connection.host);
    console.log('Port:', conn.connection.port);
    console.log('Database Name:', conn.connection.name);

    if (conn.connection.db) {
      const adminDb = conn.connection.db.admin();
      const dbsList = await adminDb.listDatabases();
      console.log('\nAll databases in MongoDB instance:');
      for (const dbInfo of dbsList.databases) {
        console.log(`- Database '${dbInfo.name}' (size: ${dbInfo.sizeOnDisk} bytes)`);
        const tempConn = conn.connection.useDb(dbInfo.name);
        if (tempConn.db) {
          const cols = await tempConn.db.listCollections().toArray();
          console.log(`  Collections in '${dbInfo.name}':`, cols.map((c) => c.name));
          for (const col of cols) {
            const count = await tempConn.db.collection(col.name).countDocuments();
            console.log(`    * ${col.name}: ${count} docs`);
          }
        }
      }
    }

    await mongoose.disconnect();
    console.log('---------------------------');
  } catch (err: any) {
    console.error('MongoDB Connection Error:', err.message || err);
    process.exit(1);
  }
};

checkDb();
