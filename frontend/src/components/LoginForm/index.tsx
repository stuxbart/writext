import React, { useState } from "react";
import "./LoginForm.scss";

import { login } from "../../features/auth/authSlice";
import {
  selectLoginErrorStatus,
  selectLoginErrorMessage,
} from "../../features/errors/errorSlice";
import { useAppDispatch, useAppSelector } from "../../hooks";
import EmailInput from "../forms/EmailInput";
import PasswordInput from "../forms/PasswordInput";
import FormHeader from "../forms/FormHeader";
import FormFooter from "../forms/FormFooter";
import FormFooterButton from "../forms/FormFooterButton";
import FormFooterLink from "../forms/FormFooterLink";
import FormBody from "../forms/FormBody";

function LoginForm(): JSX.Element {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onUsernameChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUsername(e.target.value);
  const onPasswordChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value);

  const dispatch = useAppDispatch();

  const isErrorSet = useAppSelector(selectLoginErrorStatus);
  const errorMessage = useAppSelector(selectLoginErrorMessage);

  const canSubmit = () => username !== "" && password !== "";

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const res: any = await dispatch(login({ username, password }));
    if (res.error) {
      setPassword("");
    }
  };

  return (
    <>
      <FormHeader title="Welcome at Writext!" description="Log in" />
      <FormBody
        errorMsg={errorMessage}
        onSubmit={onSubmit}
        canSubmit={canSubmit()}
      >
        <EmailInput
          value={username}
          onChange={onUsernameChanged}
          name="email"
          placeholder="user@writext.com"
          label="E-mail"
          error={isErrorSet}
          autofocus
        />
        <PasswordInput
          value={password}
          onChange={onPasswordChanged}
          name="password"
          placeholder="password"
          label="Password"
          error={isErrorSet}
        />
      </FormBody>
      <FormFooter>
        <FormFooterButton
          active={canSubmit()}
          onClick={onSubmit}
          title="Login"
        />
        <FormFooterLink to="/password-reset" title="Forgot password?" />
      </FormFooter>
    </>
  );
}

export default LoginForm;
