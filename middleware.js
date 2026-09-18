import { NextResponse } from 'next/server';

// Edge-level guard for /admin. This is a fast first line of defence; every admin page
// and API route independently verifies the session server-side as well.
export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('mg_admin_session')?.value;
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
