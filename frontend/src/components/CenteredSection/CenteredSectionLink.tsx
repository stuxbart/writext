import React from "react";
import { Link } from "react-router-dom";
import "./CenteredSection.scss";

type CenteredSectionLinkProps = {
  children: any;
  to: string;
};

function CenteredSectionLink({
  children,
  to,
}: CenteredSectionLinkProps): JSX.Element {
  return (
    <Link to={to} className="centered__section-container_a">
      {children}
    </Link>
  );
}

export default CenteredSectionLink;
