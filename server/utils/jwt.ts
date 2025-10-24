import { SignJWT, jwtVerify } from "jose";

function getSecret() {
  const sec = useRuntimeConfig().JWT_SECRET;
  if (!sec) throw new Error("Missing JWT_SECRET");
  return new TextEncoder().encode(sec);
}

export async function signJwt(payload: Record<string, any>, expiresIn = "7d") {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyJwt(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload;
}
