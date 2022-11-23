import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ProjectEdit.scss";

import FileList from "../../components/FileList";
import PDFViewer from "../../components/PDFViewer";
import TextEditor from "../../components/TextEditor";

import { fetchProject } from "../../features/projects/projectSlice";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { selectEditorLoading } from "../../features/editor/newEditorSlice";
import EditorNavbar from "../../components/EditorNavbar";

type ProjectEditProps = {
  setReady: CallableFunction;
};

function ProjectEdit({ setReady }: ProjectEditProps): JSX.Element {
  let linkParams = useParams();
  const dispatch = useAppDispatch();
  const isProjectLoading = useAppSelector(selectEditorLoading);

  const projectId = linkParams.projectId;

  useEffect(() => {
    if (projectId !== undefined) {
      dispatch(fetchProject(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    setReady(!isProjectLoading);
  }, [setReady, isProjectLoading]);

  if (isProjectLoading) {
    return <></>;
  }

  return (
    <>
      <EditorNavbar />
      <div className="editor__section">
        <div className="editor__section-container">
          <FileList />
          <TextEditor />
          <PDFViewer />
        </div>
      </div>
    </>
  );
}

export default ProjectEdit;
