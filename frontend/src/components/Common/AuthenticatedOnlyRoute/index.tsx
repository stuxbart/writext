import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  selectAuthenticationStatus,
  selectAuthLoading,
} from "../../../features/auth/authSlice";
import { useAppSelector } from "../../../hooks";

/*
 * Returns null when authentication status is loading.
 * Redirects to login page if user is not authenticated,
 * otherwise render child component.
 */
function AuthenticatedOnlyRoute({
  children,
}: React.PropsWithChildren): JSX.Element | null {
  const isAuthenticated = useAppSelector(selectAuthenticationStatus);
  const isLoading = useAppSelector(selectAuthLoading);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return null;
  }
  if (isAuthenticated) {
    return <>{children}</>;
  } else {
    return null;
  }
}

export default AuthenticatedOnlyRoute;
