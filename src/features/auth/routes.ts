const PUBLIC_ROUTES = new Set(["/", "/login", "/register"]);
const AUTH_ROUTES = new Set(["/login", "/register"]);

export const isPublicRoute = (pathname: string) => {
  if (PUBLIC_ROUTES.has(pathname)) {
    return true;
  }

  return !pathname.startsWith("/app");
};

export const isPrivateRoute = (pathname: string) => pathname.startsWith("/app");

export const isAuthRoute = (pathname: string) => AUTH_ROUTES.has(pathname);

export const resolvePrivateRedirect = (pathname: string) => {
  if (!isPrivateRoute(pathname)) {
    return null;
  }

  return `/login?next=${encodeURIComponent(pathname)}`;
};

export const resolvePostAuthRedirect = (next: string | null) => {
  if (!next) {
    return "/app";
  }

  if (!next.startsWith("/app")) {
    return "/app";
  }

  return next;
};
