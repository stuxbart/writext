import React from "react";
import "./Feature.scss";

export type FeatureProps = {
  title: string;
  description: string;
  imgSrc: string;
  imgAlt: string;
};

function Feature({
  title,
  description,
  imgSrc,
  imgAlt,
}: FeatureProps): JSX.Element {
  return (
    <div className="features__container_feature">
      <div className="feature__header">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="feature__image">
        <img src={imgSrc} alt={imgAlt} />
      </div>
    </div>
  );
}

export default Feature;
