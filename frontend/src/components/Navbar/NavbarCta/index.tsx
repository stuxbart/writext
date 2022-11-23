import React from "react";
import { Link } from "react-router-dom";
import "./NavbarCta.scss";

export type NavbarCtaProps = {
  to: string;
  title: string;
};

function NavbarCta({ to, title }: NavbarCtaProps): JSX.Element {
  return (
    <div className="navbar__cta">
      <Link replace to={to}>
        {title}
      </Link>
    </div>
  );
}

export default NavbarCta;
