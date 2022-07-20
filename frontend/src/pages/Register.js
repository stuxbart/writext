import React, { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { register } from "../features/auth/authSlice"
import { clearError, setError } from "../features/errors/errorSlice"
import { useNavigate } from 'react-router'
import CenteredContainer from "../components/CenteredContainer";

import TextInput from "../components/forms/TextInput";
import PasswordInput from "../components/forms/PasswordInput"
import CheckboxInput from "../components/forms/CheckboxInput";
import SubmitButton from "../components/forms/SubmitButton";


function Register() {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password1, setPassword1] = useState('')
    const [password2, setPassword2] = useState('')

    const onEmailChanged = (e) => setEmail(e.target.value)
    const onUsernameChanged = (e) => setUsername(e.target.value)
    const onPassword1Changed = (e) => setPassword1(e.target.value)
    const onPassword2Changed = (e) => setPassword2(e.target.value)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

    if (isAuthenticated) navigate('/projects');


    const onRegisterBtnClicked = async (e) => {
        e.preventDefault()
        
        try {
            const response = await dispatch(register({ email, username, password:password1 })).unwrap()

            if (response.password){
                dispatch(setError(null, response.password, 0))
                setPassword1('')
                setPassword2('')
            }
            else {
                setEmail('')
                setUsername('')
                setPassword1('')
                setPassword2('')
                dispatch(clearError());
                navigate('/login')
            }

        } catch (err) {
            dispatch(setError(12, "Nie udało sie zarejestrować", 213))
            console.log(err)

        }
    }
    

    const didPasswordsMatch = () => password1 === password2
    const canSubmit = () => (email !== '' && username !== '' && password1 !==  '' && password2 !==  '' && didPasswordsMatch())

    return (
    <CenteredContainer>
    <form style={{width: "15vw" }} onSubmit={e=> canSubmit() ? onRegisterBtnClicked(e) : null}>
        {/* <img className="mb-4" src="/docs/5.2/assets/brand/bootstrap-logo.svg" alt="" width="72" height="57"/> */}
        <h1 className="h3 mb-3 fw-normal">Zarejestruj się</h1>

        <TextInput name="username" label="Nazwa uzytkownika" value={username} onChange={onUsernameChanged} autofocus />
        <TextInput name="email" label="Email" value={email} onChange={onEmailChanged} />
        <PasswordInput name="password1" label="Hasło" value={password1} onChange={onPassword1Changed} />
        <PasswordInput name="password2" label="Powtórz Hasło" value={password2} onChange={onPassword2Changed} />

        <CheckboxInput name="rememebrme" label="Zapamiętaj mnie" value={true} onChange={e => console.log(e.target.value)}/>
        <SubmitButton label="Zarejestruj" onClick={onRegisterBtnClicked} disabled={!canSubmit()} />

        <p className="mt-5 mb-3 text-muted">© 2017–2022</p>
    </form>
    </CenteredContainer>
    )
}

export default Register