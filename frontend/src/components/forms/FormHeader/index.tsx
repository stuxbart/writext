import React from "react";
import "./FormHeader.scss";

type FormHeaderProps = {
  title: string;
  description: string;
};

function FormHeader({ title, description }: FormHeaderProps): JSX.Element {
  return (
    <div className="form__header">
      <h2 className="form__header_h2">{title}</h2>
      <p className="form__header_p">{description}</p>
    </div>
  );
}

export default FormHeader;
