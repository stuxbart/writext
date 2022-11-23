import React, { useState } from "react";
import Modal from "../Modal";
import type { ActionData } from "../Modal";
import {
  hideFolderCreateModal,
  selectCreateFolderModalOpen,
} from "../../../features/modals/modalSlice";
import {
  createFolder,
  selectCurrentFolderId,
  selectFolderPathStr,
} from "../../../features/folders/folderSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import FormBody from "../../forms/FormBody";
import TextInput from "../../forms/TextInput";

function CreateFolderModal(): JSX.Element {
  const [folderName, setFolderName] = useState("");
  const [isErrorSet, setIsErrorSet] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsloading] = useState(false);

  const onFolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFolderName(e.target.value);

  const dispatch = useAppDispatch();
  const open = useAppSelector(selectCreateFolderModalOpen);
  const selectedFolderId = useAppSelector(selectCurrentFolderId);
  const strFolderPath = useAppSelector((state) =>
    selectFolderPathStr(state, selectedFolderId)
  );

  const canSubmit = () => folderName.length > 0;

  const onClose = (e: React.SyntheticEvent) => {
    dispatch(hideFolderCreateModal());
  };

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!canSubmit()) {
      return;
    }
    setIsloading(true);
    setIsErrorSet(false);
    setErrorMessage("");

    const res: any = await dispatch(
      createFolder({ title: folderName, parent_folder: selectedFolderId })
    );

    if (res.error) {
      setIsErrorSet(true);
      setErrorMessage(res.payload.error);
    } else {
      dispatch(hideFolderCreateModal());
    }

    setIsloading(false);
  };

  const actions: ActionData[] = [
    { name: "Cancel", onClick: onClose, style: "secondary" },
    { name: "Create", onClick: onSubmit, style: "priamry" },
  ];

  return (
    <Modal
      open={open}
      title="Create folder"
      onClose={onClose}
      actions={actions}
      isLoading={isLoading}
    >
      <FormBody
        onSubmit={onSubmit}
        errorMsg={errorMessage}
        canSubmit={canSubmit()}
      >
        <TextInput
          label="Folder name"
          error={isErrorSet}
          value={folderName}
          onChange={onFolderNameChange}
          name="name"
          placeholder="New folder"
          autofocus
        />
        <TextInput
          label="Path"
          name="folder"
          value={strFolderPath + folderName}
          readOnly={true}
          error={isErrorSet}
        />
      </FormBody>
    </Modal>
  );
}
export default CreateFolderModal;
