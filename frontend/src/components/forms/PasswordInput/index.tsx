import React from "react";
import TextInput from "../TextInput";
import "./PasswordInput.scss";

type PasswordInputProps = {
  name: string;
  value: string;
  onChange: React.ChangeEventHandler;
  placeholder?: string;
  label?: string;
  autofocus?: boolean;
  error?: boolean;
  errorMsg?: string;
};

function PasswordInput(props: PasswordInputProps): JSX.Element {
  return <TextInput {...props} type="password" />;
}

export default PasswordInput;
