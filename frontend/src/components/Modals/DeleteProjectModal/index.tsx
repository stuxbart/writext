import React, { useState } from "react";
import Modal, { ActionData } from "../Modal";
import {
  hideProjectDeleteModal,
  showInfoModal,
  selectDeleteProjectModalOpen,
  selectDeleteProjectModalData,
} from "../../../features/modals/modalSlice";
import {
  deleteProject,
  selectProjectById,
} from "../../../features/projects/projectSlice";
import {
  fetchFolders,
  selectFolderPathStr,
} from "../../../features/folders/folderSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks";

function DeleteProjectModal(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();

  const open = useAppSelector(selectDeleteProjectModalOpen);
  const projectId = useAppSelector(selectDeleteProjectModalData);
  const project = useAppSelector((state) =>
    selectProjectById(state, projectId)
  );

  let parentFolderId: number | undefined = undefined;
  if (project !== undefined) {
    parentFolderId = project.folder;
  }

  const strFolderPath = useAppSelector((state) =>
    selectFolderPathStr(state, parentFolderId)
  );

  if (projectId === undefined || project === undefined) {
    return <></>;
  }

  const onClose = (e: React.SyntheticEvent) => {
    dispatch(hideProjectDeleteModal());
  };

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res: any = await dispatch(deleteProject({ id: projectId }));

    dispatch(fetchFolders());
    dispatch(hideProjectDeleteModal());
    if (res.error) {
      dispatch(
        showInfoModal({
          title: "Error occured",
          message: "Something went wrong, try again.",
        })
      );
    } else {
      dispatch(
        showInfoModal({
          title: "Project has been deleted",
          message: `Project "${
            strFolderPath + project.title
          }" has been deleted.`,
        })
      );
    }
    setIsLoading(false);
  };

  const actions: ActionData[] = [
    { name: "Cancel", onClick: onClose, style: "secondary" },
    { name: "Delete", onClick: onSubmit, style: "danger" },
  ];

  return (
    <Modal
      open={open}
      title="Delete project"
      onClose={onClose}
      actions={actions}
      isLoading={isLoading}
    >
      <>Are you sure you want to delete "{project.title}"?</>
    </Modal>
  );
}
export default DeleteProjectModal;
