import React from "react";
import {
  deselectFolder,
  FolderFilter,
  // selectFolderFilter,
  setFilter as setFolderFilter,
} from "../../features/folders/folderSlice";
import {
  showFolderCreateModal,
  showProjectCreateModal,
} from "../../features/modals/modalSlice";
import "./SideFolderMenu.scss";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  selectProjectFilter,
  ProjectFilter,
  setFilter as setProjectFilter,
} from "../../features/projects/projectSlice";
import SearchInput from "../SearchInput";
import SideMenuControls, { ActionProps, ActionTypes } from "./SideMenuControls";
import SideMenuFiltersList, { FilterProps } from "./SideMenuFiltersList";

function SideFolderMenu(): JSX.Element {
  const projectFilter = useAppSelector(selectProjectFilter);
  // const folderFilter = useAppSelector(selectFolderFilter);
  const dispatch = useAppDispatch();

  const onCreateProject = () => {
    dispatch(showProjectCreateModal());
  };
  const onCreateFolder = () => {
    dispatch(showFolderCreateModal());
  };

  const onFilterSelect = (filter: number) => {
    switch (filter) {
      case 0:
        dispatch(setFolderFilter(FolderFilter.All));
        dispatch(setProjectFilter(ProjectFilter.All));
        break;
      case 1:
        dispatch(setFolderFilter(FolderFilter.Owned));
        dispatch(setProjectFilter(ProjectFilter.Owned));
        break;
      case 2:
        dispatch(setFolderFilter(FolderFilter.Shared));
        dispatch(setProjectFilter(ProjectFilter.Shared));
        break;
      default:
        break;
    }
    dispatch(deselectFolder());
  };

  const actions: ActionProps[] = [
    {
      title: "New project",
      onClick: onCreateProject,
      type: ActionTypes.PRIAMRY,
    },
    {
      title: "New folder",
      onClick: onCreateFolder,
      type: ActionTypes.SECONDARY,
    },
  ];

  const filters: FilterProps[] = [
    { title: "All", active: projectFilter === ProjectFilter.All },
    { title: "Owned", active: projectFilter === ProjectFilter.Owned },
    { title: "Shared for you", active: projectFilter === ProjectFilter.Shared },
  ];
  return (
    <>
      <div className="projects__folders">
        <SideMenuControls actions={actions} />
        <SearchInput label="Search in folder" placeholder="Folder..." />
        <SideMenuFiltersList
          filters={filters}
          onFilterSelect={onFilterSelect}
        />
      </div>
    </>
  );
}

export default SideFolderMenu;
