import React from "react";
import Feature, { FeatureProps } from "./Feature";
import "./FeaturesSection.scss";

const features = [
  {
    title: "Nullam semper",
    description:
      "Nulla vestibulum commodo risus, eget sollicitudin justo molestie aliquet. Donec in aliquet dui. Suspendisse imperdiet sed arcu vitae ornare. Nulla in posuere erat. Suspendisse a faucibus turpis. Donec iaculis tortor in varius mattis. Proin lacinia blandit hendrerit. Sed risus urna, ullamcorper ac eleifend at, ornare at tortor.",
    imgSrc: "...",
    imgAlt: "Nullam",
  },
  {
    title: "Nulla vestibulum",
    description:
      "Mauris quis blandit neque. Phasellus hendrerit orci ac lorem fringilla, sed convallis massa placerat. Donec et ligula elit. Vestibulum auctor, quam at accumsan facilisis, augue purus laoreet felis, tincidunt viverra massa ante nec nibh. Nullam sem lorem, convallis vel tortor ac, fermentum luctus ligula. Donec eu vulputate enim. Aenean id orci in augue interdum pharetra. Morbi quis ullamcorper quam, sit amet porttitor augue.",
    imgSrc: "...",
    imgAlt: "Nulla",
  },
  {
    title: "Quisque vitae",
    description:
      "Vivamus vel tincidunt tellus, in semper neque. Proin tincidunt eleifend elementum. Nulla rhoncus sollicitudin mi in iaculis. Proin id accumsan massa. Integer ultrices consectetur turpis, eu molestie leo tempus vulputate. Nulla eget convallis ante, vitae venenatis velit. Nulla molestie nunc ac ipsum venenatis dictum. Pellentesque efficitur velit id tortor viverra ultricies. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nunc sagittis elit nisi, eget fringilla lorem hendrerit sit amet.",
    imgSrc: "...",
    imgAlt: "Quisque",
  },
  {
    title: "Mauris cursus",
    description:
      "Nullam commodo hendrerit nisi quis posuere. Integer vel congue lacus. Sed sed pretium purus. Duis varius mauris tempor est dictum, vitae pulvinar velit iaculis. Nulla eu nunc eget ex convallis auctor. Donec in rutrum ante. Nullam vel tellus libero. In imperdiet vestibulum mi sed accumsan.",
    imgSrc: "...",
    imgAlt: "Mauris",
  },
];

function FeaturesSection(): JSX.Element {
  return (
    <div className="features primary__background">
      <div className="features__title gradient__text">
        <h1>Lorem, ipsum dolor sit amet consectetur adipisicing elit.</h1>
      </div>
      <div className="features__container">
        {features?.map((item: FeatureProps, index) => (
          <Feature
            key={index}
            title={item.title}
            description={item.description}
            imgSrc={item.imgSrc}
            imgAlt={item.imgAlt}
          />
        ))}
      </div>
    </div>
  );
}

export default FeaturesSection;
