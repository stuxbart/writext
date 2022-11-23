import React from "react";
import "./CenteredSection.scss";

type CenteredSectionMessageProps = {
  children: any;
};

function CenteredSectionMessage({
  children,
}: CenteredSectionMessageProps): JSX.Element {
  return <p className="centered__section-container_p">{children}</p>;
}

export default CenteredSectionMessage;
