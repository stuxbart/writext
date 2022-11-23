import React from "react";
import { selectMediaFileById } from "../../../features/editor/newEditorSlice";
import { useAppSelector } from "../../../hooks";
import FileListItem from "../FileListItem";
import "./MediaFileListItem.scss";

type MediaFileListItemProps = {
  id: number;
};

function MediaFileListItem({ id }: MediaFileListItemProps): JSX.Element {
  const file = useAppSelector((state) => selectMediaFileById(state, id));

  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    // dispatch(setSource(id));
  };
  const selected = false;
  const name = file?.name || "";

  return <FileListItem onClick={onClick} title={name} selected={selected} />;
}

export default MediaFileListItem;
