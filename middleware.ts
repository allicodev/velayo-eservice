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
      url.pathname = "/login";
      return NextResponse.rewrite(url);
    }
  }
  const authRoute = ["/login"];
  const protectedRoute = [
    "/teller/home",
    "/encoder/home",
    "/admin/home",
    "/accounting",
    "/pos/settings",
  ];

  if (pathname == "/") {
    if (currentUser) url.pathname = `/${currentUser.role}/home`;
    else url.pathname = "/login";
  } else {
    // auth check if pos settings access is admin
    if (pathname == "/pos/settings") {
      if (currentUser && currentUser.role == "admin")
        url.pathname = "/pos/settings";
      else {
        if (currentUser) url.pathname = `/${currentUser.role}/home`;
        else url.pathname = "/login";
      }
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
  }
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/teller/home",
    "/encoder/home",
    "/admin/home",
    "/pos/settings",
    "/accounting",
  ],
};
