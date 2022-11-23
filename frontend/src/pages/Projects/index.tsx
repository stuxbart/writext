import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  fetchProjects,
  selectProjectsFetchStatus,
} from "../../features/projects/projectSlice";
import "./Projects.scss";

import SideFolderMenu from "../../components/SideFolderMenu";
import ProjectList from "../../components/ProjectList";

import { useAppDispatch, useAppSelector } from "../../hooks";
import ProjectsNavbar from "../../components/ProjectsNavbar";
import FolderPathBreadcrumb from "../../components/FolderPathBreadcrumb";
import {
  deselectFolder,
  fetchFolders,
  selectFolder,
} from "../../features/folders/folderSlice";

type ProjectsProps = {
  setReady: CallableFunction;
};

function Projects({ setReady }: ProjectsProps): JSX.Element {
  const isLoading = useAppSelector(selectProjectsFetchStatus);
  const linkParams = useParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (linkParams.folderId) {
      dispatch(selectFolder(Number(linkParams.folderId)));
    } else {
      dispatch(deselectFolder());
    }
  }, [dispatch, linkParams.folderId]);

  useEffect(() => {
    dispatch(fetchFolders());
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    setReady(!isLoading);
  }, [isLoading, setReady]);

  if (isLoading) {
    return <></>;
  }
  return (
    <>
      <ProjectsNavbar />
      <div className="projects__section">
        <div className="projects__section-container">
          <SideFolderMenu />
          <FolderPathBreadcrumb />
          <ProjectList />
        </div>
      </div>
    </>
  );
}

export default Projects;
