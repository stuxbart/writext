import React from "react";
import { Link } from "react-router-dom";
import "./HomeCTA.scss";

function HomeCTA(): JSX.Element {
  return (
    <div className="cta primary__background">
      <div className="cta__container dark__background">
        <div className="cta__title">
          <h1 className="gradient__text">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </h1>
        </div>
        <div className="cta__button">
          <Link replace to="/register">
          Try it now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomeCTA;
