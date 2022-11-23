import React from "react";
import { Link } from "react-router-dom";
import "./Herosection.scss";

function HeroSection(): JSX.Element {
  return (
    <div className="hero gradient__background">
      <div className="hero__container">
        <div className="hero__title">
          <h1 className="gradient__text">Online LaTeX editor.</h1>
          <Link replace to="/register" className="hero__button">
            Try it now
          </Link>
        </div>
        <div className="hero__feature">
          <div className="hero__feature_container">
            <img src="" alt="feature" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
