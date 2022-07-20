import React, { useState, useEffect } from "react";
import { useDispatch, connect } from 'react-redux';
import { login } from "../features/auth/authSlice"
import { clearError, setError } from "../features/errors/errorSlice"
import { useNavigate } from 'react-router'
import CenteredContainer from "../components/CenteredContainer";



function Login(props) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    
    const onUsernameChanged = (e) => setUsername(e.target.value)
    const onPasswordChanged = (e) => setPassword(e.target.value)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const onLoginBtnClicked = async (e) => {
        e.preventDefault()

        try {
            const response = await dispatch(login({username, password})).unwrap()

            if (response.error){
                dispatch(setError(null, response.error, 0))
            }
            else {

                setUsername('')
                setPassword('')
                dispatch(clearError());
            }

        } catch (err) {
            dispatch(setError(12, "Nie udało sie zalogować", 213))
            console.log(err)

        }
    }
    useEffect(() => {
        if (props.isAuthenticated) navigate('/projects');
    })


    const canSubmit = () => (username !== '' && password !==  '')
    return (
    <CenteredContainer>
    <form style={{width: "15vw" }} onSubmit={e=> canSubmit() ? onLoginBtnClicked(e) : null}>
        {/* <img className="mb-4" src="/docs/5.2/assets/brand/bootstrap-logo.svg" alt="" width="72" height="57"/> */}
        <h1 className="h3 mb-3 fw-normal">Please sign in</h1>

        <div className="form-floating">
            <input
                type="text"
                id="usernameField"
                name="username"
                className="form-control"
                placeholder="Nazwa użytkownika"
                value={username}
                onChange={onUsernameChanged}
            />
            <label htmlFor="usernameField">Nazwa użytkownika</label>
        </div>
        <div className="form-floating">
            <input 
                type="password"
                id="passwordField"
                name="password"
                className="form-control"
                placeholder="Hasło"
                value={password}
                onChange={onPasswordChanged}
            />
            <label htmlFor="passwordField">Hasło</label>
        </div>

        <div className="checkbox mb-3">
        <label>
            <input type="checkbox" value="remember-me"/> Remember me
        </label>
        </div>
        <button 
            type="submit"
            className="w-100 btn btn-lg btn-primary"
            onClick={onLoginBtnClicked}
            disabled={!canSubmit()}>
            Zaloguj
        </button>
        <p className="mt-5 mb-3 text-muted">© 2017–2022</p>
    </form>
    </CenteredContainer>
    )
}


function mapStateToProps(state){
    return {
        isAuthenticated: state.auth.isAuthenticated
    }
}
export default connect(mapStateToProps)(Login);