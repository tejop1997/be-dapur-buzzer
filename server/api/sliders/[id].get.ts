import { Slider } from "~/server/models/slider";
import { Buffer } from "node:buffer";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Missing id" });

  const item = await Slider.findById(id).lean();
  if (!item) throw createError({ statusCode: 404, statusMessage: "Slider not found" });
  const { imageData, imageType, ...rest } = item as any;
  const dataUrl = `data:${imageType};base64,${(imageData as Buffer).toString("base64")}`;
  return { ...rest, image: dataUrl };
});
