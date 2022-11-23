import React from "react";

import {
  selectAuthenticationStatus,
  selectUsername,
} from "../../features/auth/authSlice";
import { useAppSelector } from "../../hooks";
import "./ProjectsNavbar.scss";

import SmallNavbar, {
  NavabrLogo,
  NavbarLink,
  NavbarLinks,
  NavbarLinkType,
  NavbarMenu,
} from "../SmallNavbar";

function ProjectsNavbar(): JSX.Element {
  const isAuthenticated = useAppSelector(selectAuthenticationStatus);
  const username = useAppSelector(selectUsername);

  const menuLinks = [
    { title: "Settings", to: "/settings" },
    { title: "Your projects", to: "/projects" },
    { title: "Logout", to: "/logout" },
  ];

  return (
    <SmallNavbar>
      <NavabrLogo linkTo="/projects" />

      <NavbarLinks>
        <NavbarLink type={NavbarLinkType.Link} replace to="/">
          Home
        </NavbarLink>
        <NavbarLink type={NavbarLinkType.Link} replace to="/features">
          Features
        </NavbarLink>
        <NavbarLink type={NavbarLinkType.Link} replace to="/features">
          Docs
        </NavbarLink>
        <NavbarLink type={NavbarLinkType.Link} replace to="/features">
          About
        </NavbarLink>
      </NavbarLinks>

      <NavbarMenu show={isAuthenticated} title={username} links={menuLinks} />
    </SmallNavbar>
  );
}

export default ProjectsNavbar;
