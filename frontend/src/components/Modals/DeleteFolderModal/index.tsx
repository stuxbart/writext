import React, { useState } from "react";
import Modal from "../Modal";
import type { ActionData } from "../Modal";
import {
  hideFolderDeleteModal,
  showInfoModal,
  selectDeleteFolderModalOpen,
  selectDeleteFoldertModalData,
} from "../../../features/modals/modalSlice";
import {
  fetchFolders,
  deleteFolder,
  selectFolderById,
  selectFolderPathStr,
} from "../../../features/folders/folderSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks";

function DeleteFolderModal(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const open = useAppSelector(selectDeleteFolderModalOpen);
  const folderId = useAppSelector(selectDeleteFoldertModalData);
  const folder = useAppSelector((state) => selectFolderById(state, folderId));
  const strFolderPath = useAppSelector((state) =>
    selectFolderPathStr(state, folderId)
  );

  if (folder === undefined) {
    return <></>;
  }

  const onClose = (e: React.SyntheticEvent) => {
    dispatch(hideFolderDeleteModal());
  };

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res: any = await dispatch(deleteFolder({ id: folderId }));

    dispatch(fetchFolders());
    dispatch(hideFolderDeleteModal());
    if (res.error) {
      dispatch(
        showInfoModal({
          title: "Error occured.",
          message: "Something went wrong, try again.",
        })
      );
    } else {
      dispatch(
        showInfoModal({
          title: "Folder has been deleted",
          message: `Folder "${strFolderPath}" has been deleted.`,
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
      title="Delete folder"
      onClose={onClose}
      actions={actions}
      isLoading={isLoading}
    >
      <>
        Are you sure you want to delete "{folder.title}"? <br />({strFolderPath}
        )
      </>
    </Modal>
  );
}
export default DeleteFolderModal;
