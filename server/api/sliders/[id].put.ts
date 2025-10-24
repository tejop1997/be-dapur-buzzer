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
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Missing id" });

  const body = await readBody(event);
  const update: any = {};

  if (typeof body.title === "string") update.title = body.title.trim();
  if (typeof body.image === "string") {
    const image = body.image.trim();
    let mime: string | undefined = typeof body.imageType === "string" ? body.imageType : undefined;
    let base64 = image;
    const dataUrlMatch = /^data:(.+?);base64,(.+)$/.exec(image);
    if (dataUrlMatch) {
      mime = dataUrlMatch[1];
      base64 = dataUrlMatch[2];
    } else if (!mime) {
      mime = "image/png";
    }

    let buffer: Buffer;
    try {
      buffer = Buffer.from(base64, "base64");
    } catch {
      throw createError({ statusCode: 400, statusMessage: "Invalid base64 image" });
    }

    const MAX_BYTES = 2 * 1024 * 1024;
    if (buffer.byteLength > MAX_BYTES) {
      throw createError({ statusCode: 413, statusMessage: "Image too large (max 2MB)" });
    }

    update.imageData = buffer;
    update.imageType = mime!;
  }
  if (typeof body.link === "string") update.link = body.link.trim();
  if (body.active !== undefined) update.active = Boolean(body.active);

  const item = await Slider.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).lean();

  if (!item) throw createError({ statusCode: 404, statusMessage: "Slider not found" });
  const { imageData, imageType, ...rest } = item as any;
  const dataUrl = `data:${imageType};base64,${(imageData as Buffer).toString("base64")}`;
  return { ...rest, image: dataUrl };
});
