import { User } from "~/server/models/user";

export default defineEventHandler(async (event) => {
  const { email, password, role } = await readBody(event);
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email & password required",
    });
  }
  const exists = await User.findOne({ email }).lean();
  if (exists)
    throw createError({ statusCode: 409, statusMessage: "Email already used" });

  const user = await User.create({
    email,
    password,
    role: role === "admin" ? "admin" : "user",
  });
  return { id: user._id, email: user.email, role: user.role };
});
