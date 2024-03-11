import { NextRequest, NextResponse } from "next/server";
import { verify } from "./assets/ts";

const JWT_SECRET = process.env.JWT_PRIVATE_KEY ?? "";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  const token = req.cookies.get("token");
  let currentUser;

  if (token) {
    try {
      currentUser = await verify(token, JWT_SECRET);
    } catch (e) {
      const res = NextResponse.next();
      res.cookies.clear();
      return res;
    }
  }
  const authRoute = ["/login"];
  const protectedRoute = ["/teller/home", "/encoder/home", "/admin/home"];

  if (pathname == "/") {
    if (currentUser) url.pathname = `/${currentUser.role}/home`;
    else url.pathname = "/login";
  } else {
    if (protectedRoute.includes(pathname)) {
      if (currentUser) {
        url.pathname = `/${currentUser.role}/home`;
      } else {
        url.pathname = "/login";
      }
    } else if (authRoute.includes(pathname) && currentUser) {
      url.pathname = `/${currentUser.role}/home`;
    }
  }
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/", "/login", "/teller/home", "/encoder/home", "/admin/home"],
};
