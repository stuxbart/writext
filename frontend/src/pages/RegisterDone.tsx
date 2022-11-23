import React from "react";
import CenteredSectionLink from "../components/CenteredSection/CenteredSectionLink";
import CenteredSectionMessage from "../components/CenteredSection/CenteredSectionMessage";
import CenteredSection from "../components/CenteredSection/index";
import Footer from "../components/Footer/index";
import Navbar from "../components/Navbar";

import { setGradientNavbar } from "../features/style/styleSlice";
import { useAppDispatch } from "../hooks";

function RegisterCorfirm(): JSX.Element {
  const dispatch = useAppDispatch();

  dispatch(setGradientNavbar());
  return (
    <>
      <Navbar />
      <CenteredSection className="gradient__background">
        <CenteredSectionMessage>
          Thanks for registration.
          <br />
          Now you can
          <CenteredSectionLink to="/login">log in</CenteredSectionLink>.
        </CenteredSectionMessage>
      </CenteredSection>
      <Footer />
    </>
  );
}

export default RegisterCorfirm;
