import React, { MouseEventHandler } from "react";
import "./FormFooterButton.scss";

type FormFooterButtonProps = {
  title: string;
  onClick: MouseEventHandler;
  active: boolean;
};

function FormFooterButton({
  title,
  onClick,
  active,
}: FormFooterButtonProps): JSX.Element {
  const buttonClass = active
    ? "form__footer-action_button"
    : "form__footer-action_button form__footer-action_button--disabled";

  return (
    <div className="form__footer-action">
      <button className={buttonClass} onClick={(e) => active && onClick(e)}>
        {title}
      </button>
    </div>
  );
}

export default FormFooterButton;
