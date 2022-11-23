import React from "react";

import {
  selectAuthenticationStatus,
  selectUsername,
} from "../../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { IoIosHome } from "react-icons/io";
import { GrDownload } from "react-icons/gr";
import "./EditorNavbar.scss";

import {
  compile,
  selectCompilationResultLink,
  selectCurrentProjectId,
  selectCurrentProjectName,
  selectCurrentSourceId,
} from "../../features/editor/newEditorSlice";
import { updateProject } from "../../features/projects/projectSlice";
import SmallNavbar, {
  NavabrLogo,
  NavbarEditableTitle,
  NavbarLink,
  NavbarLinks,
  NavbarLinkType,
  NavbarMenu,
} from "../SmallNavbar";

function EditorNavbar(): JSX.Element {
  const isAuthenticated = useAppSelector(selectAuthenticationStatus);
  const username = useAppSelector(selectUsername);
  const pdfLink = useAppSelector(selectCompilationResultLink);
  const currentSourceId = useAppSelector(selectCurrentSourceId);
  const currentProjectName = useAppSelector(selectCurrentProjectName);
  const currentProjectId = useAppSelector(selectCurrentProjectId) || "";

  const dispatch = useAppDispatch();

  const onCompile = (event: React.SyntheticEvent) => {
    dispatch(compile({ fileId: currentSourceId }));
  };

  const onSubmit = (currentTitle: string) => {
    dispatch(updateProject({ id: currentProjectId, title: currentTitle }));
  };

  const menuLinks = [
    { title: "Settings", to: "/settings" },
    { title: "Your projects", to: "/projects" },
    { title: "Logout", to: "/logout" },
  ];

  return (
    <SmallNavbar>
      <NavabrLogo linkTo={isAuthenticated ? "/projects" : "/"} />

      <NavbarLinks>
        <NavbarLink type={NavbarLinkType.Link} replace to="/projects">
          <IoIosHome />
        </NavbarLink>
        <NavbarLink
          type={NavbarLinkType.ExternalLink}
          href={pdfLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GrDownload />
        </NavbarLink>
        <NavbarLink type={NavbarLinkType.Button} onClick={onCompile}>
          Compile
        </NavbarLink>
      </NavbarLinks>

      <NavbarEditableTitle onSubmit={onSubmit} title={currentProjectName} />
      <NavbarMenu show={isAuthenticated} title={username} links={menuLinks} />
    </SmallNavbar>
  );
}

export default EditorNavbar;
