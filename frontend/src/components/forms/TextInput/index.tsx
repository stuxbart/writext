import React from "react";
import "./TextInput.scss";

type TextInputProps = {
  name: string;
  value?: string;
  onChange?: React.ChangeEventHandler;
  placeholder?: string;
  label?: string;
  autofocus?: boolean;
  error?: boolean;
  errorMsg?: string;
  type?: string;
  readOnly?: boolean;
};

function TextInput({
  name,
  value,
  onChange,
  placeholder = "",
  label = "",
  autofocus = false,
  error = false,
  errorMsg = "",
  type = "text",
  readOnly = false,
}: TextInputProps): JSX.Element {
  const fieldClass = error ? "form__field form__field--error" : "form__field";

  if (!label) {
    label = name;
  }
  return (
    <div className={fieldClass}>
      <label className="form__field-label" htmlFor={`#${name}-input`}>
        {label}
      </label>
      {errorMsg && <span className="form__field-error">{errorMsg}</span>}

      <input
        id={`${name}-input`}
        className="form__field-input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoFocus={autofocus}
        readOnly={readOnly}
      />
    </div>
  );
}

export default TextInput;
