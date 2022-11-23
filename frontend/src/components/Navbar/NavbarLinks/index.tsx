import React from "react";
import "./NavbarLinks.scss";
import NavbarLink, { NavbarLinkProps } from "../NavbarLink";

type NavbarLinksProps = {
  links: NavbarLinkProps[];
};

function NavbarLinks({ links }: NavbarLinksProps): JSX.Element {
  return (
    <div className="navbar__links">
      {links.map((link, index) => (
        <NavbarLink key={index} {...link} />
      ))}
    </div>
  );
}

export default NavbarLinks;
