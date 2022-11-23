import React from "react";
import "./LoadingBar.scss";

type LoadingBarProps = {
  show?: boolean;
};

function LoadingBar({ show = true }: LoadingBarProps): JSX.Element {
  return <div className={`loading__bar ${show && "loading__bar--show"}`}></div>;
}
export default LoadingBar;
