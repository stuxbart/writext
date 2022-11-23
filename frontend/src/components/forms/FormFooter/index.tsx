import React from "react";
import "./FormFooter.scss";

type FormFooterProps = {
  children: any;
};

function FormFooter({ children }: FormFooterProps): JSX.Element {
  return <div className="form__footer">{children}</div>;
}

export default FormFooter;
