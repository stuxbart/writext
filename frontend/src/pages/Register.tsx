import React from "react";
import { useNavigate } from "react-router";

import FormSection from "../components/FormSection";
import RegisterForm from "../components/RegisterForm";
import Footer from "../components/Footer";

import { setGradientNavbar } from "../features/style/styleSlice";
import { selectAuthenticationStatus } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import Navbar from "../components/Navbar";

function Register(): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectAuthenticationStatus);

  if (isAuthenticated) navigate("/projects");

  dispatch(setGradientNavbar());
  return (
    <>
      <Navbar />
      <FormSection className="gradient__background">
        <RegisterForm />
      </FormSection>
      <Footer />
    </>
  );
}

export default Register;
