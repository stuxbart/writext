import React, { useState } from "react";
import Modal from "../Modal";
import type { ActionData } from "../Modal";
import {
  hideProjectCreateModal,
  selectCreateProjectModalOpen,
} from "../../../features/modals/modalSlice";
import { createProject } from "../../../features/projects/projectSlice";
import {
  fetchFolders,
  selectCurrentFolderId,
  selectFolderPathStr,
} from "../../../features/folders/folderSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import FormBody from "../../forms/FormBody";
import TextInput from "../../forms/TextInput";

function CreateProjectModal(): JSX.Element {
  const [projectTitle, setProjectTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorSet, setIsErrorSet] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const open = useAppSelector(selectCreateProjectModalOpen);
  const selectedFolderId = useAppSelector(selectCurrentFolderId);
  const strFolderPath = useAppSelector((state) =>
    selectFolderPathStr(state, selectedFolderId)
  );
  const dispatch = useAppDispatch();

  const onProjectTitleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setProjectTitle(e.target.value);

  const canSubmit = () => projectTitle.length > 0;

  const onClose = (e: React.SyntheticEvent) => {
    dispatch(hideProjectCreateModal());
  };

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsErrorSet(false);
    setErrorMessage("");

    const res: any = await dispatch(
      createProject({ title: projectTitle, folderId: selectedFolderId })
    );

    if (res.error) {
      setIsErrorSet(true);
      setErrorMessage(res.payload.error);
    } else {
      dispatch(fetchFolders());
      dispatch(hideProjectCreateModal());
    }
    setIsLoading(false);
  };

  const actions: ActionData[] = [
    { name: "Cancel", onClick: onClose, style: "secondary" },
    { name: "Create", onClick: onSubmit, style: "priamry" },
  ];

  return (
    <Modal
      open={open}
      title="Create project"
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
          name="title"
          value={projectTitle}
          onChange={onProjectTitleChange}
          label="Project title"
          error={isErrorSet}
          autofocus
        />
        <TextInput
          name="folder"
          value={strFolderPath + projectTitle}
          label="Path"
          error={isErrorSet}
          readOnly
        />
      </FormBody>
    </Modal>
  );
}
export default CreateProjectModal;
