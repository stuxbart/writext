import React from "react";
import "./LoadingScreen.scss";
import logo from "../../../assets/logo3.png";

function LoadingScreen(): JSX.Element {
  return (
    <div className="loading__screen loading__screen--show">
      <div className="loading__img">
        <img src={logo} />
      </div>
      {/* <div className="loading__spinner"></div> */}
      <div className="loading__text">Loading...</div>
    </div>
  );
}

export default LoadingScreen;
