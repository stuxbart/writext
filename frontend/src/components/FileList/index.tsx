import React from "react";
import { useAppSelector } from "../../hooks";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import "./FileList.scss";

import {
  selectAllSourceIds,
  selectCurrentProjectId,
  selectMediaFileAllIds,
} from "../../features/editor/newEditorSlice";
import {
  showFileCreateModal,
  showFileUploadModal,
} from "../../features/modals/modalSlice";
import { IoIosCloudUpload, IoIosOptions } from "react-icons/io";

import { AiFillFileAdd } from "react-icons/ai";
import SourceFileListItem from "./SourceFileListItem";
import MediaFileListItem from "./MediaFileListItem";

function FileList(): JSX.Element {
  const fileAllIds = useSelector(selectAllSourceIds, shallowEqual);
  const projectId = useSelector(selectCurrentProjectId);
  const mediaFileAllIds = useAppSelector(selectMediaFileAllIds);
  const dispatch = useDispatch();

  const onFileCreate = () => {
    if (projectId !== undefined) {
      dispatch(showFileCreateModal(projectId));
    }
  };

  const onFileUpload = () => {
    if (projectId !== undefined) {
      dispatch(showFileUploadModal(projectId));
    }
  };

  const onOpenOptions = () => {
    if (projectId !== undefined) {
      // dispatch(showFileCreateModal(projectId));
    }
  };

  function renderSourceFiles() {
    let renderedFiles = [];
    for (let i = 0; i < fileAllIds.length; i++) {
      const fileId = fileAllIds[i];
      renderedFiles.push(<SourceFileListItem key={fileId} id={fileId} />);
    }
    return renderedFiles;
  }

  function renderMediaFiles() {
    let renderedFiles = [];
    for (let i = 0; i < mediaFileAllIds.length; i++) {
      const fileId = Number(mediaFileAllIds[i]);
      renderedFiles.push(<MediaFileListItem key={fileId} id={fileId} />);
    }
    return renderedFiles;
  }

  return (
    <div className="editor__file-list_container">
      <div className="editor__file-controls">
        <button className="editor__file-controls_button" onClick={onFileCreate}>
          <AiFillFileAdd />
        </button>
        <button className="editor__file-controls_button" onClick={onFileUpload}>
          <IoIosCloudUpload />
        </button>
        <button
          className="editor__file-controls_button"
          onClick={onOpenOptions}
        >
          <IoIosOptions />
        </button>
      </div>
      <h3 className="editor__file-list_header">Source Files</h3>
      <div className="editor__file-list">{renderSourceFiles()}</div>
      <h3 className="editor__file-list_header">Media Files</h3>
      <div className="editor__file-list">{renderMediaFiles()}</div>
    </div>
  );
}

export default FileList;
