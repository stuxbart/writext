import React from "react";
import CenteredSection from "../components/CenteredSection";
import CenteredSectionHeader from "../components/CenteredSection/CenteredSectionHeader";
import CenteredSectionLink from "../components/CenteredSection/CenteredSectionLink";
import CenteredSectionMessage from "../components/CenteredSection/CenteredSectionMessage";
import Footer from "../components/Footer/index";
import Navbar from "../components/Navbar";
import { setGradientNavbar } from "../features/style/styleSlice";
import { useAppDispatch } from "../hooks";

function Error404(): JSX.Element {
  const dispatch = useAppDispatch();

  dispatch(setGradientNavbar());
  return (
    <>
      <Navbar />
      <CenteredSection className="gradient__background">
        <CenteredSectionHeader>Error 404</CenteredSectionHeader>
        <CenteredSectionMessage>
          Page not found. <br />
          <CenteredSectionLink to="/">Back to home page</CenteredSectionLink>.
        </CenteredSectionMessage>
      </CenteredSection>
      <Footer />
    </>
  );
}

export default Error404;
