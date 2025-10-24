import mongoose from "mongoose";

// Safer defaults for serverless
mongoose.set("strictQuery", true);
mongoose.set("bufferTimeoutMS", 30000);

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

  // Use dbName option instead of concatenating to URI (safer for SRV/Atlas URIs)
  const uri = MONGODB_URI;

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 120000,
    retryWrites: true,
    dbName: MONGODB_DB || undefined,
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
