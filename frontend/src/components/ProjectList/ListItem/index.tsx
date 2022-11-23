import React from "react";
import { FaFileAlt, FaFolder } from "react-icons/fa";
import "./ListItem.scss";

export enum ListItemType {
  FOLDER,
  PROJECT,
}

export type ActionData = {
  onClick: React.MouseEventHandler;
  icon: JSX.Element;
};
type ListItemProps = {
  title: string;
  lastEdit: string;
  type: ListItemType;
  actions: ActionData[];
  onClick: React.MouseEventHandler;
  unseenChanges?: boolean;
};

function ListItem({
  title,
  lastEdit,
  type,
  actions,
  onClick,
  unseenChanges = false,
}: ListItemProps): JSX.Element {
  function makeActionOnClick(func: any) {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      func(e);
    };
  }
  const lastEditDate = new Date(lastEdit);
  return (
    <div className="projects__project-list-item" onClick={onClick}>
      <div className="projects__project-list-item-groupA">
        <div className="projects__project-list-item-icon">
          {type === ListItemType.PROJECT && <FaFileAlt />}
          {type === ListItemType.FOLDER && <FaFolder />}
        </div>
        <div className="projects__project-list-item-name">
          <h2>{title}</h2>
          <p>Last edited: {lastEditDate.toLocaleDateString()}</p>
        </div>
      </div>

      <div className="projects__project-list-item-groupB">
        <div className="projects__project-list-item-labels">
          {unseenChanges && (
            <span className="projects__project-list-item-labels_label">
              New changes
            </span>
          )}
          {/* {project.todo && (
            <span className="projects__project-list-item-labels_label">
              Todo
            </span>
          )} */}
        </div>
        <div className="projects__project-list-item-controls">
          {actions.map((action, index) => (
            <button
              key={index}
              className="projects__project-list-item-controls_button blue_text"
              onClick={makeActionOnClick(action.onClick)}
            >
              {action.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ListItem;
