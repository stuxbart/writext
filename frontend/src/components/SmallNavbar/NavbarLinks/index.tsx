import React from "react";
import "./NavbarLinks.scss";

type NavbarLinksProps = {
  children: any;
};

function NavbarLinks({ children }: NavbarLinksProps): JSX.Element {
  return <div className="small-navbar__links">{children}</div>;
}

export default NavbarLinks;
