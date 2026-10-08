import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blog_platform';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (err) {
    console.error(`[MongoDB] Connection error for URI (${uri}):`, err.message);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
};
