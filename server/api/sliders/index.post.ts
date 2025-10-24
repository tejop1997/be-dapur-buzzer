import { Slider } from "~/server/models/slider";
import { Buffer } from "node:buffer";

function requireAdmin(event: any) {
  const user = (event as any).context?.user;
  if (!user || user.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Admin only" });
  }
}

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const body = await readBody(event);

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const image = typeof body.image === "string" ? body.image.trim() : "";
  const link = typeof body.link === "string" ? body.link.trim() : undefined;
  const active = body.active === undefined ? true : Boolean(body.active);

  if (!title || !image) {
    throw createError({ statusCode: 400, statusMessage: "title and image are required" });
  }

  // Parse Base64 input (supports data URL or raw base64). For raw base64, you can pass optional imageType.
  let mime: string | undefined = typeof body.imageType === "string" ? body.imageType : undefined;
  let base64 = image;
  const dataUrlMatch = /^data:(.+?);base64,(.+)$/.exec(image);
  if (dataUrlMatch) {
    mime = dataUrlMatch[1];
    base64 = dataUrlMatch[2];
  } else if (!mime) {
    mime = "image/png"; // default for prototype
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(base64, "base64");
  } catch {
    throw createError({ statusCode: 400, statusMessage: "Invalid base64 image" });
  }

  const MAX_BYTES = 2 * 1024 * 1024; // ~2MB guard for prototype
  if (buffer.byteLength > MAX_BYTES) {
    throw createError({ statusCode: 413, statusMessage: "Image too large (max 2MB)" });
  }

  const doc = await Slider.create({ title, imageData: buffer, imageType: mime!, link, active });
  const obj = doc.toObject();
  // Return data URL for convenience and omit raw buffer
  const dataUrl = `data:${obj.imageType};base64,${(obj.imageData as Buffer).toString("base64")}`;
  const { imageData, imageType, ...rest } = obj as any;
  return { ...rest, image: dataUrl };
});
