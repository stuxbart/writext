import React from "react";

import "./SmallNavbar.scss";

import NavabrLogo from "./NavbarLogo";
import NavbarLinks from "./NavbarLinks";
import NavbarLink, { NavbarLinkType } from "./NavbarLink";
import NavbarEditableTitle from "./NavbarEditableTitle";
import NavbarMenu from "./NavbarMenu";

type SmallNavbarProps = {
  children: any;
};

function SmallNavbar({ children }: SmallNavbarProps) {
  return <div className="small-navbar priamry__bottom-border">{children}</div>;
}

export default SmallNavbar;

export {
  NavabrLogo,
  NavbarLinks,
  NavbarLink,
  NavbarLinkType,
  NavbarEditableTitle,
  NavbarMenu,
};
