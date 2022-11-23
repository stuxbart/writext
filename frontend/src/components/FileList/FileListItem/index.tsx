import React from "react";
import "./FileListItem.scss";

const MAX_TITLE_LENGTH = 18;

type FileListItemProps = {
  title: string;
  maxVisibleTitleLength?: number;
  onClick: React.MouseEventHandler;
  selected: boolean;
};

function FileListItem({
  title,
  maxVisibleTitleLength = MAX_TITLE_LENGTH,
  onClick,
  selected,
}: FileListItemProps): JSX.Element {
  const croppedTitle =
    title.length > maxVisibleTitleLength
      ? title.slice(0, maxVisibleTitleLength) + "..."
      : title;

  const className = selected
    ? "editor__file-list-item editor__file-list-item--active"
    : "editor__file-list-item";

  return (
    <div className={className}>
      <div className="editor__file-list-item-name" onClick={onClick}>
        <p>{croppedTitle}</p>
      </div>
      <div className="editor__file-list-item-controls"></div>
    </div>
  );
}

export default FileListItem;
