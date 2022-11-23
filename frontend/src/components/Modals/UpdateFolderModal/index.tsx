import React, { useEffect, useState } from "react";
import Modal, { ActionData } from "../Modal";
import {
  hideFolderUpdateModal,
  selectUpdateFolderModalOpen,
  selectUpdateFolderModalData,
} from "../../../features/modals/modalSlice";

import {
  fetchFolders,
  updateFolder,
  selectFolderById,
  selectFolderPathStr,
} from "../../../features/folders/folderSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import FormBody from "../../forms/FormBody";
import TextInput from "../../forms/TextInput";

function UpdateFolderModal(): JSX.Element {
  const [folderName, setFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorSet, setIsErrorSet] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const open = useAppSelector(selectUpdateFolderModalOpen);
  const folderId = useAppSelector(selectUpdateFolderModalData);
  const folder = useAppSelector((state) => selectFolderById(state, folderId));
  const dispatch = useAppDispatch();

  const onFolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFolderName(e.target.value);

  useEffect(() => {
    if (folder !== undefined) {
      setFolderName(folder.title);
    }
  }, [folder]);

  let parentFolderId: number | undefined = undefined;
  if (folder !== undefined) {
    parentFolderId = folder.parent_folder;
  }

  const strFolderPath = useAppSelector((state) =>
    selectFolderPathStr(state, parentFolderId)
  );

  if (folder === undefined || folderId === undefined) {
    return <></>;
  }

  const canSubmit = () => folderName.length > 0;
  const onClose = (e: React.SyntheticEvent) => {
    dispatch(hideFolderUpdateModal());
  };

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!canSubmit()) {
      return;
    }
    setIsLoading(true);
    setIsErrorSet(false);
    setErrorMessage("");

    const res: any = await dispatch(
      updateFolder({ id: folderId, title: folderName })
    );

    if (res.error) {
      setIsErrorSet(true);
      setErrorMessage(res.payload.error);
    } else {
      dispatch(fetchFolders());
      dispatch(hideFolderUpdateModal());
    }

    setIsLoading(false);
  };

  const actions: ActionData[] = [
    { name: "Cancel", onClick: onClose, style: "secondary" },
    { name: "Edit", onClick: onSubmit, style: "priamry" },
  ];

  return (
    <Modal
      open={open}
      title="Folder edit"
      onClose={onClose}
      actions={actions}
      isLoading={isLoading}
    >
      <FormBody
        onSubmit={onSubmit}
        canSubmit={canSubmit()}
        errorMsg={errorMessage}
      >
        <TextInput
          label="Folderu name"
          name="name"
          placeholder="Folder name"
          value={folderName}
          onChange={onFolderNameChange}
          error={isErrorSet}
          autofocus
        />
        <TextInput
          label="Paths"
          name="path"
          value={strFolderPath + folderName + "/"}
          error={isErrorSet}
          readOnly
        />
      </FormBody>
    </Modal>
  );
}
export default UpdateFolderModal;
