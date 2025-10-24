import mongoose from "mongoose";

// Safer defaults for serverless
mongoose.set("strictQuery", true);
mongoose.set("bufferCommands", false);

export default defineNitroPlugin(async () => {
  // Reuse existing connection promise across cold/warm starts
  const g = globalThis as any;
  if (g._mongooseConn) {
    try {
      await g._mongooseConn;
      return;
    } catch {
      /* fallthrough to reconnect */
    }
  }

  if (mongoose.connection.readyState === 1) return;

  const { MONGODB_URI, MONGODB_DB } = useRuntimeConfig();
  if (!MONGODB_URI) {
    console.error("❌ Missing MONGODB_URI");
    return;
  }

  const uri = MONGODB_DB ? `${MONGODB_URI}/${MONGODB_DB}` : MONGODB_URI;

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    retryWrites: true,
  } as const;

  g._mongooseConn = mongoose.connect(uri, options).catch((err: any) => {
    console.error("❌ MongoDB connection error:", err.message);
    delete g._mongooseConn;
  });

  try {
    await g._mongooseConn;
    console.log("✅ MongoDB connected to", MONGODB_DB || "(default)");
  } catch {
    console.error("⚠️ MongoDB connection failed");
  }
});
