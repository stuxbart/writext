import React from "react";
import "./SideMenuControls.scss";

export enum ActionTypes {
  PRIAMRY,
  SECONDARY,
}

export type ActionProps = {
  title: string;
  onClick: React.MouseEventHandler;
  type?: ActionTypes;
};

type SideMenuControlsProps = {
  actions: ActionProps[];
};

function SideMenuControls({ actions }: SideMenuControlsProps): JSX.Element {
  return (
    <div className="projects__folder-controls">
      {actions.map((action, index) => (
        <button
          key={index}
          className={`projects__folder-controls_button ${
            action.type === ActionTypes.SECONDARY &&
            "projects__folder-controls_button--secondary"
          }`}
          onClick={action.onClick}
        >
          {action.title}
        </button>
      ))}
    </div>
  );
}

export default SideMenuControls;
