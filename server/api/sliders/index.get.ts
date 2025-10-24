import { Slider } from "~/server/models/slider";
import { Buffer } from "node:buffer";

export default defineEventHandler(async (event) => {
  const q = getQuery(event);
  const filter: any = {};

  if (q.active !== undefined) {
    filter.active = q.active === "true" || q.active === "1";
  }
  if (q.search && typeof q.search === "string") {
    filter.title = { $regex: q.search, $options: "i" };
  }

  const limit = Math.min(parseInt(String(q.limit || "50"), 10) || 50, 100);
  const page = Math.max(parseInt(String(q.page || "1"), 10) || 1, 1);
  const skip = (page - 1) * limit;

  const sort = { createdAt: -1 } as const;

  const [items, total] = await Promise.all([
    Slider.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Slider.countDocuments(filter),
  ]);

  const itemsMapped = (items as any[]).map(({ imageData, imageType, ...rest }) => {
    const dataUrl = `data:${imageType};base64,${(imageData as Buffer).toString("base64")}`;
    return { ...rest, image: dataUrl };
  });

  return {
    items: itemsMapped,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
});
