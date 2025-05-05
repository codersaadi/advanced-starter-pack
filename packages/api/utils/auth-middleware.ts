// MIDDLEWARE HERE
interface AuthMiddlewareConfig<RequestType> {
  publicRoutes: string[];
  authRoutes: string[];
  apiAuthPrefix: string;
  loginRedirect: string;
  signin: string;
  req: RequestType;
  isLoggedIn: boolean;
}

export const createAuthMiddleware = <RequestType>({
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  signin,
  loginRedirect,
  isLoggedIn,
  req,
}: AuthMiddlewareConfig<RequestType>) => {
  const { nextUrl } = req as Request & { nextUrl: URL };
  const isApiAuth = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  // IF AUTH API THEN WE WILL RETURN BUT IF THE REQUEST IS TO SIGN API WE WILL LET IT REDIRECT, IF THE USER IS LOGGED IN
  if (isApiAuth && !(nextUrl.pathname === signin)) {
    return;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(loginRedirect, nextUrl));
    }
    return;
  }
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL(signin, nextUrl));
  }
  return;
};
