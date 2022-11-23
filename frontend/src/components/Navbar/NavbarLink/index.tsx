import React from "react";
import { Link } from "react-router-dom";
import "./NavbarLink.scss";

export type NavbarLinkProps = {
  to: string;
  title: string;
  isActive?: boolean;
};

function NavbarLink({ to, title, isActive=false }: NavbarLinkProps): JSX.Element {
  const className = isActive
    ? "navbar__links_link navbar__links_link--active"
    : "navbar__links_link";
  return (
    <div className={className}>
      <Link replace to={to}>
        {title}
      </Link>
    </div>
  );
}

export default NavbarLink;
