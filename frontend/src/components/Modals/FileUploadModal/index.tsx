import React, { useState } from "react";
import Modal from "../Modal";
import type { ActionData } from "../Modal";
import {
  selectUploadFileModalOpen,
  selectUploadFileModalData,
  hideFileUploadModal,
} from "../../../features/modals/modalSlice";
import { uploadFile } from "../../../features/editor/newEditorSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import FileInput from "../../forms/FileInput";
import FormBody from "../../forms/FormBody";

function UploadFileModal() {
  const [file, setFile] = useState({} as File);
  const [isSelected, setIsSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorSet, setIsErrorSet] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const open = useAppSelector(selectUploadFileModalOpen);
  const projectId = useAppSelector(selectUploadFileModalData);
  const dispatch = useAppDispatch();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files !== null && e.target.files[0] !== null) {
      setFile(e.target.files[0]);
      setIsSelected(true);
    }
  };

  const onClose = (e: React.SyntheticEvent) => {
    dispatch(hideFileUploadModal());
  };

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!isSelected) {
      return;
    }
    setIsLoading(true);
    setIsErrorSet(false);
    setErrorMessage("");

    const res: any = await dispatch(
      uploadFile({ projectId: projectId, file: file })
    );

    if (res.error) {
      setIsErrorSet(true);
      setErrorMessage(res.payload.error);
    } else {
      setFile({} as File);
      setIsSelected(false);
      dispatch(hideFileUploadModal());
    }

    setIsLoading(false);
  };

  const actions: ActionData[] = [
    { name: "Cancel", onClick: onClose, style: "secondary" },
    { name: "Upload", onClick: onSubmit, style: "priamry" },
  ];

  return (
    <Modal
      open={open}
      title="Upload file"
      onClose={onClose}
      actions={actions}
      isLoading={isLoading}
    >
      <FormBody onSubmit={onSubmit} errorMsg={errorMessage}>
        <FileInput
          label="File"
          name="file"
          onChange={onFileChange}
          error={isErrorSet}
        />
      </FormBody>
    </Modal>
  );
}
export default UploadFileModal;
