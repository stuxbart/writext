import React, { useState } from "react";
import Modal from "../Modal";
import type { ActionData } from "../Modal";
import {
  hideFileCreateModal,
  selectCreateFileModalOpen,
  selectCreateFileModalData,
} from "../../../features/modals/modalSlice";
import { createSource } from "../../../features/editor/newEditorSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import TextInput from "../../forms/TextInput";
import FormBody from "../../forms/FormBody";

function CreateFileModal() {
  const [filename, setFilename] = useState("");
  const [isErrorSet, setIsErrorSet] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsloading] = useState(false);

  const onFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFilename(e.target.value);

  const open = useAppSelector(selectCreateFileModalOpen);
  const projectId = useAppSelector(selectCreateFileModalData);
  const dispatch = useAppDispatch();

  const onClose = (e: React.SyntheticEvent) => {
    dispatch(hideFileCreateModal());
  };

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsloading(true);
    setIsErrorSet(false);
    setErrorMessage("");

    const res: any = await dispatch(createSource({ filename, projectId }));

    if (res.error) {
      setIsErrorSet(true);
      setErrorMessage(res.payload.error);
    } else {
      dispatch(hideFileCreateModal());
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
      title="Create new file"
      onClose={onClose}
      actions={actions}
      isLoading={isLoading}
    >
      <FormBody onSubmit={onSubmit} errorMsg={errorMessage}>
        <TextInput
          name="name"
          value={filename}
          onChange={onFilenameChange}
          placeholder="New file"
          label="Filename"
          autofocus
          error={isErrorSet}
        />
      </FormBody>
    </Modal>
  );
}

export default CreateFileModal;
