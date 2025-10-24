import { H3Event, getCookie, getHeader } from "h3";
import { verifyJwt } from "~/server/utils/jwt";

export default defineEventHandler(async (event: H3Event) => {
  const auth = getHeader(event, "authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
  const token = bearer || getCookie(event, "token");
  if (!token) return;

  try {
    const payload = await verifyJwt(token);
    event.context.user = payload;
  } catch {}
});
