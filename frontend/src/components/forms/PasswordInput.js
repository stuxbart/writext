import React from "react"

function PasswordInput({ name, value, onChange, placeholder, label }){

    return (
    <div className="form-floating">
        <input
            type="password"
            id="usernameField"
            name={name}
            className="form-control"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
        <label htmlFor="usernameField">{label}</label>
    </div>
    )
}

export default PasswordInput