// TODO: Re-implement proper User/Admin role separation with working login

import { NextResponse } from "next/server";

// Middleware is temporarily disabled — no redirects or role checks.
// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
// };

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};