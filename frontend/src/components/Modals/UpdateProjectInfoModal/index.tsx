import React, { useEffect, useState } from "react";
import Modal, { ActionData } from "../Modal";
import {
  hideProjectUpdateModal,
  selectUpdateProjectModalOpen,
  selectUpdateProjectModalData,
} from "../../../features/modals/modalSlice";
import {
  updateProject,
  selectProjectById,
} from "../../../features/projects/projectSlice";
import {
  fetchFolders,
  selectFolderPathStr,
} from "../../../features/folders/folderSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import FormBody from "../../forms/FormBody";
import TextInput from "../../forms/TextInput";

function UpdateProjectInfoModal(): JSX.Element {
  const [projectTitle, setProjectTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorSet, setIsErrorSet] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const open = useAppSelector(selectUpdateProjectModalOpen);
  const projectId = useAppSelector(selectUpdateProjectModalData);
  const project = useAppSelector((state) =>
    selectProjectById(state, projectId)
  );
  const strFolderPath = useAppSelector((state) =>
    selectFolderPathStr(state, project?.folder)
  );
  const dispatch = useAppDispatch();

  const onProjectTitleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setProjectTitle(e.target.value);

  useEffect(() => {
    if (project !== undefined) {
      setProjectTitle(project.title);
    }
  }, [project]);

  if (project === undefined || projectId === undefined) {
    return <></>;
  }

  const canSubmit = () => projectTitle.length > 0;
  const onClose = (e: React.SyntheticEvent) => {
    dispatch(hideProjectUpdateModal());
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
      updateProject({
        id: projectId,
        title: projectTitle,
        folderId: project.folder,
      })
    );

    if (res.error) {
      setIsErrorSet(true);
      setErrorMessage(res.payload.error);
    } else {
      dispatch(fetchFolders());
      dispatch(hideProjectUpdateModal());
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
      title="Project edit"
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
          label="Project title"
          name="title"
          value={projectTitle}
          onChange={onProjectTitleChange}
          error={isErrorSet}
          autofocus
        />
        <TextInput
          label="Path"
          name="path"
          value={strFolderPath + projectTitle}
          error={isErrorSet}
          readOnly
        />
      </FormBody>
    </Modal>
  );
}
export default UpdateProjectInfoModal;
