import React from "react";
import "./CenteredSection.scss";

type CenteredSectionHeaderProps = {
  children: any;
};

function CenteredSectionHeader({
  children,
}: CenteredSectionHeaderProps): JSX.Element {
  return <h2 className="centered__section-container_h">{children}</h2>;
}

export default CenteredSectionHeader;
