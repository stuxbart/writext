import React from "react";
import { useAppSelector } from "../../hooks";
import {
  selectCurrentFolderId,
  selectParentFolders,
} from "../../features/folders/folderSlice";
import "./FolderPathBreadcrumb.scss";
import { useNavigate, useSearchParams } from "react-router-dom";

type FolderPathItemProps = {
  title: string;
  onClick: React.MouseEventHandler;
};

function FolderPathItem({ title, onClick }: FolderPathItemProps) {
  return (
    <li className="projects__folder-path_li">
      <button onClick={onClick}>{title}</button>
    </li>
  );
}

function FolderPathBreadcrumb(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedFolderId = useAppSelector(selectCurrentFolderId);
  const parentFolders = useAppSelector((state) =>
    selectParentFolders(state, selectedFolderId, true)
  );

  const onFolderClick = (folderId: number | undefined) => {
    setSearchParams({ q: "" });
    if (folderId === undefined) {
      navigate(`/projects/`, { replace: true });
    } else {
      navigate(`/projects/${folderId}/`, { replace: true });
    }
  };

  return (
    <div className="projects__folder-path">
      <ul className="projects__folder-path_ul">
        <li className="projects__folder-path_li">
          <button onClick={() => onFolderClick(undefined)}>Home</button>
        </li>

        {parentFolders.map((folder) => (
          <FolderPathItem
            key={folder.id}
            title={folder.title}
            onClick={() => onFolderClick(folder.id)}
          />
        ))}
      </ul>
    </div>
  );
}

export default FolderPathBreadcrumb;
