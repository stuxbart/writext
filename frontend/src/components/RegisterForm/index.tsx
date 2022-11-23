import React, { useState } from "react";
import "./RegisterForm.scss";

import { register } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  selectRegisterErrorMessage,
  selectRegisterFieldsErrors,
} from "../../features/errors/errorSlice";
import TextInput from "../forms/TextInput";
import EmailInput from "../forms/EmailInput";
import PasswordInput from "../forms/PasswordInput";
import FormHeader from "../forms/FormHeader";
import FormFooter from "../forms/FormFooter";
import FormFooterButton from "../forms/FormFooterButton";
import FormFooterLink from "../forms/FormFooterLink";
import FormBody from "../forms/FormBody";

function RegisterForm(): JSX.Element {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");

  const onEmailChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEmail(e.target.value);
  const onUsernameChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUsername(e.target.value);
  const onPassword1Changed = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPassword1(e.target.value);
  const onPassword2Changed = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPassword2(e.target.value);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const errorMessage = useAppSelector(selectRegisterErrorMessage);
  const fieldErrors = useAppSelector(selectRegisterFieldsErrors);

  const didPasswordsMatch = () => password1 === password2;
  const canSubmit = () =>
    email !== "" &&
    username !== "" &&
    password1 !== "" &&
    password2 !== "" &&
    didPasswordsMatch();

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!canSubmit()) return;

    const res: any = await dispatch(
      register({ email, username, password: password1 })
    );

    if (res.error) {
      if (res.payload.email) {
        setEmail("");
      }
      if (res.payload.username) {
        setEmail("");
      }
      setPassword1("");
      setPassword2("");
    } else {
      setEmail("");
      setUsername("");
      setPassword1("");
      setPassword2("");
      navigate("/register-done");
    }
  };

  return (
    <>
      <FormHeader
        title="Welcome at Writext!"
        description="Create your account"
      />
      <FormBody
        errorMsg={errorMessage}
        onSubmit={onSubmit}
        canSubmit={canSubmit()}
      >
        <TextInput
          value={username}
          onChange={onUsernameChanged}
          name="username"
          label="Username"
          placeholder="Username"
          error={Boolean(fieldErrors.username)}
          errorMsg={fieldErrors.username}
        />
        <EmailInput
          value={email}
          onChange={onEmailChanged}
          name="email"
          placeholder="user@writext.com"
          label="E-mail"
          error={Boolean(fieldErrors.email)}
          errorMsg={fieldErrors.email}
        />
        <PasswordInput
          value={password1}
          onChange={onPassword1Changed}
          name="password1"
          placeholder="password"
          label="Password"
          error={Boolean(fieldErrors.password)}
          errorMsg={fieldErrors.password}
        />
        <PasswordInput
          value={password2}
          onChange={onPassword2Changed}
          name="password2"
          placeholder="password"
          label="Repeat password"
          error={Boolean(fieldErrors.password)}
        />
      </FormBody>
      <FormFooter>
        <FormFooterButton
          active={canSubmit()}
          onClick={onSubmit}
          title="Register"
        />
        <FormFooterLink to="/login" title="Already have account?" />
      </FormFooter>
    </>
  );
}

export default RegisterForm;
