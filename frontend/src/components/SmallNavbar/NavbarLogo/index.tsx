import React from "react";
import { Link } from "react-router-dom";
import logo from "../../../assets/logo3.png";
import "./NavbarLogo.scss";

type NavbarLogoProps = {
  linkTo: string;
};

function NavabrLogo({ linkTo }: NavbarLogoProps): JSX.Element {
  return (
    <div className="small-navbar__logo ">
      <Link replace to={linkTo}>
        <img src={logo} alt="logo" />
      </Link>
      <Link replace to={linkTo}>
        ritext
      </Link>
    </div>
  );
}

export default NavabrLogo;
