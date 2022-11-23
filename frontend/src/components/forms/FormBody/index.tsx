import React, { FormEventHandler } from "react";
import "./FormBody.scss";

type FormBodyProps = {
  children: any;
  onSubmit?: FormEventHandler;
  errorMsg?: string;
  canSubmit?: boolean;
};

function FormBody({
  children,
  onSubmit,
  errorMsg = "",
  canSubmit = true,
}: FormBodyProps): JSX.Element {
  const isErrorSet = Boolean(errorMsg);

  const onKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.keyCode === 13) {
      onSubmit && onSubmit(e);
    }
  };

  return (
    <div className="form__body">
      {isErrorSet && (
        <div className="form__body-error">
          <p className="form__body-error_p">{errorMsg}</p>
        </div>
      )}
      <form
        className="form__body-form"
        onSubmit={(e) => canSubmit && onSubmit && onSubmit(e)}
        onKeyDown={onKeyDown}
      >
        {children}
      </form>
    </div>
  );
}

export default FormBody;
