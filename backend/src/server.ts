import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
  // 1. Connect MongoDB
  await connectDB();

  // 2. Start Express Server
  const PORT = parseInt(env.PORT, 10) || 5000;
  const server = app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 EaseHub Backend Server Running`);
    console.log(`🔊 Port: ${PORT}`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 Health API: http://localhost:${PORT}/api/health`);
    console.log(`=================================`);
  });

  // Handle unhandled rejections cleanly
  process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled Promise Rejection:', err);
    server.close(() => process.exit(1));
  });
};

startServer();
