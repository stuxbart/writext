import React from "react";
import "./Modal.scss";
import { FaTimes } from "react-icons/fa";
import LoadingBar from "../../LoadingBar";

type ModalProps = {
  open: boolean;
  onClose: any;
  title: string;
  children: JSX.Element | JSX.Element[] | string;
  actions: ActionData[];
  isLoading?: boolean;
};
export type ActionData = {
  name: string;
  style: string;
  onClick: any;
};
type StyleClases = {
  [index: string]: string;
};
const styleClasses: StyleClases = {
  default: "modal__action--primary",
  priamry: "modal__action--primary",
  secondary: "modal__action--secondary",
  danger: "modal__action--danger ",
};

function Modal({
  open,
  onClose,
  title,
  children,
  actions = [],
  isLoading = false,
}: ModalProps): JSX.Element {
  return (
    <div className={`modal ${open ? "modal--active" : ""}`}>
      <div className="modal__container">
        <div className="modal__header">
          <div className="modal__title">
            <h2 className="modal__title_h2">{title}</h2>
          </div>
          <div className="modal__close">
            <button className="modal__close_button" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>
        <LoadingBar show={isLoading}/>
        <div className="modal__body">{children}</div>
        <div className="modal__actions">
          {actions.length > 0 &&
            actions.map((action, index) => {
              let styleClass = "modal__action";
              if (styleClasses[action.style] !== undefined) {
                styleClass += " " + styleClasses[action.style];
              } else {
                styleClass += " " + styleClasses["default"];
              }
              return (
                <button
                  key={index}
                  className={styleClass}
                  onClick={action.onClick}
                >
                  {action.name}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default Modal;
