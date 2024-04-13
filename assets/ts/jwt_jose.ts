import { SignJWT, jwtVerify } from "jose";

export async function sign(
  payload: Record<any, any>,
  secret: string
): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 12; // 12 - hour

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(new TextEncoder().encode(secret));
}

export async function verify(
  token: string,
  secret: string
): Promise<Record<any, any>> {
  const _ = await jwtVerify(token, new TextEncoder().encode(secret));
  return _.payload;
}
