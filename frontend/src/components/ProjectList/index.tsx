import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  showProjectUpdateModal,
  showProjectDeleteModal,
  showFolderDeleteModal,
  showFolderUpdateModal,
  showProjectShareModal,
} from "../../features/modals/modalSlice";
import {
  FolderEntity,
  selectCurrentFolderContentByQuery,
} from "../../features/folders/folderSlice";
import { FaEdit, FaRegWindowClose, FaShareSquare } from "react-icons/fa";
import "./ProjectList.scss";
import { useAppDispatch, useAppSelector, useSearchQuery } from "../../hooks";
import { ProjectEntity } from "../../features/projects/projectSlice";
import ListItem, { ActionData, ListItemType } from "./ListItem";

type FolderEntityProps = {
  folder: FolderEntity;
};
type ProjectEntityProps = {
  project: ProjectEntity;
};

function FolderListItem({ folder }: FolderEntityProps): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onClick = (e: React.SyntheticEvent) => {
    setSearchParams({ q: "" });
    navigate(`/projects/${folder.id}/`, { replace: true });
  };
  const onEdit = (e: React.SyntheticEvent) => {
    dispatch(showFolderUpdateModal(folder.id));
  };
  const onDelete = (e: React.SyntheticEvent) => {
    dispatch(showFolderDeleteModal(folder.id));
  };

  const actions: ActionData[] = [
    { onClick: onEdit, icon: <FaEdit /> },
    { onClick: onDelete, icon: <FaRegWindowClose /> },
  ];

  return (
    <ListItem
      title={folder.title}
      onClick={onClick}
      type={ListItemType.FOLDER}
      lastEdit={folder.updated}
      unseenChanges={false}
      actions={actions}
    />
  );
}

function ProjectListItem({ project }: ProjectEntityProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  if (project === undefined) return <></>;
  const { canShare = false, canDelete = false, canEdit = false } = project;
  const onClick = (e: React.SyntheticEvent) => {
    navigate(`/project/${project.id}/`, { replace: true });
  };
  const onEdit = (e: React.SyntheticEvent) => {
    dispatch(showProjectUpdateModal(project.id));
  };
  const onDelete = (e: React.SyntheticEvent) => {
    dispatch(showProjectDeleteModal(project.id));
  };
  const onShare = (e: React.SyntheticEvent) => {
    dispatch(showProjectShareModal(project.id));
  };

  const actions: ActionData[] = [];
  if (canEdit) {
    actions.push({ onClick: onEdit, icon: <FaEdit /> });
  }
  if (canDelete) {
    actions.push({ onClick: onDelete, icon: <FaRegWindowClose /> });
  }
  if (canShare) {
    actions.push({ onClick: onShare, icon: <FaShareSquare /> });
  }
  return (
    <ListItem
      title={project.title}
      onClick={onClick}
      type={ListItemType.PROJECT}
      lastEdit={project.updated}
      unseenChanges={false}
      actions={actions}
    />
  );
}

function ProjectList() {
  const [searchQuery, setSearchQuery] = useSearchQuery();
  const [folders = [], projects = []] = useAppSelector((state) =>
    selectCurrentFolderContentByQuery(state, searchQuery)
  );

  const isEmpty = folders.length === 0 && projects.length === 0;
  return (
    <div className="projects__projects">
      <div className="projects__project-list">
        {!isEmpty &&
          folders.map((folder) => (
            <FolderListItem key={"f" + folder.id} folder={folder} />
          ))}
        {!isEmpty &&
          projects.map((project) => (
            <ProjectListItem key={"p" + project.id} project={project} />
          ))}

        {isEmpty && (
          <>
            <h4>You don't have any projects :(</h4>
          </>
        )}
      </div>
    </div>
  );
}

export default ProjectList;
