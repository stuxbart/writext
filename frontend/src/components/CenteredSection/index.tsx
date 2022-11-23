import React from "react";
import "./CenteredSection.scss";

type CenteredSectionProps = {
  children: any;
  className: string;
};

function CenteredSection({
  children,
  className,
}: CenteredSectionProps): JSX.Element {
  return (
    <div className={"centered__section " + className}>
      <div className="centered__section-container">{children}</div>
    </div>
  );
}

export default CenteredSection;
