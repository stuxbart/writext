import React from "react";
import "./FormSection.scss";

type FormSectionProps = {
  children?: JSX.Element;
  className: string;
};

function FormSection({ children, className }: FormSectionProps): JSX.Element {
  return (
    <div className={"form__section centered__section " + className}>
      <div className="form__section-container">{children}</div>
    </div>
  );
}

export default FormSection;
