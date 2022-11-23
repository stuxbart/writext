import React from "react";
import "./navbar.scss";

import { NavbarStyle, selectNavStyle } from "../../features/style/styleSlice";
import { useAppSelector } from "../../hooks";
import {
  selectAuthenticationStatus,
  selectUsername,
} from "../../features/auth/authSlice";
import NavbarLogo from "./NavbarLogo";
import NavbarLinks from "./NavbarLinks";
import NavbarLink from "./NavbarLink";
import NavbarCta from "./NavbarCta";
import NavbarMenu, { MenuTheme } from "./NavbarMenu";
import NavbarMobileMenu from "./NavbarMobileMenu";

function Navbar(): JSX.Element {
  const isAuthenticated = useAppSelector(selectAuthenticationStatus);
  const username = useAppSelector(selectUsername);
  const navStyle = useAppSelector(selectNavStyle);

  let navbarClass = "";

  switch (navStyle) {
    case NavbarStyle.Gradient:
      navbarClass = navbarClass.concat("gradient__background ");
      break;
    case NavbarStyle.White:
      navbarClass = navbarClass.concat("gradient__bottom-border ");
      break;

    default:
      navbarClass = navbarClass.concat("gradient__bottom-border ");
      break;
  }

  const links = [
    { title: "Home", to: "/", isActive: true },
    { title: "Features", to: "/features" },
    { title: "Docs", to: "/docs" },
    { title: "About", to: "/about" },
  ];
  const authenticatedLinks = [
    { title: "Settings", to: "/account" },
    { title: "Your projects", to: "/projects" },
    { title: "Logout", to: "/logout" },
  ];
  const unauthenticatedLinks = [
    { title: "Sign In", to: "/login" },
    { title: "Sign Up", to: "/register" },
  ];
  return (
    <div className={`navbar ${navbarClass} navbar--small-padding`}>
      <NavbarLogo linkTo={isAuthenticated ? "/projects" : "/"} />
      <NavbarLinks links={links} />

      {isAuthenticated ? (
        <NavbarMenu
          links={authenticatedLinks}
          title={username}
          theme={MenuTheme.Light}
          show={isAuthenticated}
        />
      ) : (
        <div className="navbar__auth">
          <NavbarLink to="/login" title="Sign In" />
          <NavbarCta to="/register" title="Sign Up" />
        </div>
      )}

      <NavbarMobileMenu
        links={links}
        authLinks={isAuthenticated ? authenticatedLinks : unauthenticatedLinks}
        theme={MenuTheme.Light}
      />
    </div>
  );
}

export default Navbar;
