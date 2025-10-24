import { setCookie } from "h3";
import { User } from "~/server/models/user";
import { signJwt } from "~/server/utils/jwt";

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);
  if (!email || !password)
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid credentials",
    });

  const user = await User.findOne({ email });
  if (!user)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const ok = await user.comparePassword(password);
  if (!ok)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const token = await signJwt(
    { sub: String(user._id), email: user.email, role: user.role },
    "7d"
  );

  const isProd = process.env.NODE_ENV === "production";
  setCookie(event, "token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { token, user: { id: user._id, email: user.email, role: user.role } };
});
