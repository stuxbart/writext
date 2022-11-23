import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  logout,
  selectAuthenticationStatus,
  selectAuthLoading,
} from "../features/auth/authSlice";
import { clearProjects } from "../features/projects/projectSlice";
import { clearFolders } from "../features/folders/folderSlice";
import { useAppDispatch } from "../hooks";

function Logout(): JSX.Element {
  const isAuthenticated = useSelector(selectAuthenticationStatus);
  const isLoading = useSelector(selectAuthLoading);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(logout());
      dispatch(clearProjects());
      dispatch(clearFolders());
    }
    navigate("/");
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return <></>;
}

export default Logout;
