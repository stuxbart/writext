import React from "react";
import {
  selectIsSourceSelected,
  selectSourceName,
  setSource,
} from "../../../features/editor/newEditorSlice";
import { useAppSelector, useAppDispatch } from "../../../hooks";
import FileListItem from "../FileListItem";
import "./SourceFileListItem.scss";

type SourceFileListItemProps = {
  id: number;
};

function SourceFileListItem({ id }: SourceFileListItemProps): JSX.Element {
  const name = useAppSelector((state) => selectSourceName(state, id));
  const selected = useAppSelector((state) => selectIsSourceSelected(state, id));
  const dispatch = useAppDispatch();

  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    dispatch(setSource(id));
  };

  return <FileListItem onClick={onClick} title={name} selected={selected} />;
}
export default SourceFileListItem;
