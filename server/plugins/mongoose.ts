import mongoose from "mongoose";

export default defineNitroPlugin(async () => {
  if (mongoose.connection.readyState === 1) return;

  const { MONGODB_URI, MONGODB_DB } = useRuntimeConfig();
  if (!MONGODB_URI) {
    console.error("❌ Missing MONGODB_URI");
    return;
  }

  const uri = MONGODB_DB ? `${MONGODB_URI}/${MONGODB_DB}` : MONGODB_URI;

  (globalThis as any)._mongooseConn = mongoose.connect(uri).catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    delete (globalThis as any)._mongooseConn;
  });

  try {
    await (globalThis as any)._mongooseConn;
    console.log("✅ MongoDB connected to", MONGODB_DB || "(default)");
  } catch {
    console.error("⚠️ MongoDB connection failed");
  }
});
