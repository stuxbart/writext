import React from "react";
import { Link } from "react-router-dom";
import "./FormFooterLink.scss";

type FormFooterLinkProps = {
  to: string;
  title: string;
};

function FormFooterLink({ to, title }: FormFooterLinkProps): JSX.Element {
  return (
    <div className="form__footer-link">
      <Link to={to} className="form__footer-link_a">
        {title}
      </Link>
    </div>
  );
}

export default FormFooterLink;
