import React from "react";
import TextInput from "../TextInput";
import "./EmailInput.scss";

type EmailInputProps = {
  name: string;
  value: string;
  onChange: React.ChangeEventHandler;
  placeholder?: string;
  label?: string;
  autofocus?: boolean;
  error?: boolean;
  errorMsg?: string;
};

function EmailInput(props: EmailInputProps): JSX.Element {
  return <TextInput {...props} type="email" />;
}

export default EmailInput;
