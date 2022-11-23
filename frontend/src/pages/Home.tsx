import React from "react";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import HomeCTA from "../components/HomeCTA";
import Navbar from "../components/Navbar";

import { setGradientNavbar } from "../features/style/styleSlice";
import { useAppDispatch } from "../hooks";

function Home() {
  const dispatch = useAppDispatch();

  dispatch(setGradientNavbar());
  return (
    <>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HomeCTA />
      <Footer />
    </>
  );
}

export default Home;
