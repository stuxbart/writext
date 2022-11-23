import React from "react";
import TextInput from "../TextInput";
import "./FileInput.scss";

type FileInputProps = {
  name: string;
  value?: string;
  onChange: React.ChangeEventHandler;
  placeholder?: string;
  label?: string;
  autofocus?: boolean;
  error?: boolean;
  errorMsg?: string;
};

function FileInput(props: FileInputProps): JSX.Element {
  return <TextInput {...props} type="file" />;
}

export default FileInput;
