import React from "react";
import { Link } from "react-router-dom";
import "./NavbarLogo.scss";
import logo from "../../../assets/logo3.png";

type NavbarLogoProps = {
  linkTo: string;
};

function NavbarLogo({ linkTo }: NavbarLogoProps): JSX.Element {
  return (
    <div className="navbar__logo">
      <Link replace to={linkTo}>
        <img src={logo} alt="logo" />
      </Link>
    </div>
  );
}

export default NavbarLogo;
