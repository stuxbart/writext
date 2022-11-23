import React, { useState, useEffect } from "react";
import Modal from "../Modal";
import type { ActionData } from "../Modal";
import {
  selectShareProjectModalOpen,
  selectShareProjectModalData,
  hideProjectShareModal,
} from "../../../features/modals/modalSlice";
import {
  fetchProjectAuthors,
  selectProjectById,
  shareProject,
} from "../../../features/projects/projectSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import FormBody from "../../forms/FormBody";
import TextInput from "../../forms/TextInput";

function ShareProjectModal(): JSX.Element {
  const [authorsText, setAuthorsText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorSet, setIsErrorSet] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onAuthorsTextChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAuthorsText(e.target.value);

  const dispatch = useAppDispatch();

  const open = useAppSelector(selectShareProjectModalOpen);
  const {
    id: projectId = "",
    authors = [],
    loading = false,
  } = useAppSelector(selectShareProjectModalData);

  const project = useAppSelector((state) =>
    selectProjectById(state, projectId)
  );

  useEffect(() => {
    dispatch(fetchProjectAuthors(projectId));
  }, [projectId, dispatch]);

  const canSubmit = () => authorsText.length > 0;
  const onClose = (e: React.SyntheticEvent) => {
    dispatch(hideProjectShareModal());
  };

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!canSubmit()) {
      return;
    }
    setIsLoading(true);
    setIsErrorSet(false);
    setErrorMessage("");

    const authorsArray = authorsText.split(";");
    const res: any = await dispatch(
      shareProject({ id: projectId, emails: authorsArray })
    );

    if (res.error) {
      setIsErrorSet(true);
      setErrorMessage(res.payload.error);
    } else {
      setAuthorsText("");
    }

    dispatch(fetchProjectAuthors(projectId));
    setIsLoading(false);
  };

  const actions: ActionData[] = [
    { name: "Cancel", onClick: onClose, style: "secondary" },
    { name: "Share", onClick: onSubmit, style: "priamry" },
  ];

  return (
    <Modal
      open={open}
      title="Share project"
      onClose={onClose}
      actions={actions}
      isLoading={isLoading || loading}
    >
      <div className="modal__message">
        Share "{project?.title}" with others.
        <br />
        Type emails of new project authors separated by semicolon (;).
      </div>

      <FormBody
        onSubmit={onSubmit}
        canSubmit={canSubmit()}
        errorMsg={errorMessage}
      >
        <TextInput
          label="New authors"
          name="users"
          placeholder="user@writext.com;user2@writext.com"
          value={authorsText}
          onChange={onAuthorsTextChange}
          error={isErrorSet}
          autofocus
        />
      </FormBody>
      <div>
        Current authors:
        {authors.map((author) => (
          <p>{author.email}</p>
        ))}
      </div>
    </Modal>
  );
}
export default ShareProjectModal;
