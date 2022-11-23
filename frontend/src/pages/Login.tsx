import React, { useEffect } from "react";
import { useNavigate } from "react-router";

import { setGradientNavbar } from "../features/style/styleSlice";
import LoginForm from "../components/LoginForm";
import FormSection from "../components/FormSection";
import Footer from "../components/Footer";
import { selectAuthenticationStatus } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import Navbar from "../components/Navbar";

function Login(): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectAuthenticationStatus);

  useEffect(() => {
    if (isAuthenticated) navigate("/projects");
    dispatch(setGradientNavbar());
  });

  return (
    <>
      <Navbar />
      <FormSection className="gradient__background">
        <LoginForm />
      </FormSection>
      <Footer />
    </>
  );
}

export default Login;
