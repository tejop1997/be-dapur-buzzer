import { Slider } from "~/server/models/slider";

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

  const item = await Slider.findByIdAndDelete(id).lean();
  if (!item) throw createError({ statusCode: 404, statusMessage: "Slider not found" });
  return { success: true };
});
