import React from "react"

function TextInput({ name, value, onChange, placeholder, label, autoComplete, autofocus }){

    return (
    <div className="form-floating">
        <input
            type="text"
            id="usernameField"
            name={name}
            className="form-control"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            autoComplete={autoComplete ? "on" : "off"}
            autoFocus={autofocus}
        />
        <label htmlFor="usernameField">{label}</label>
    </div>
    )
}

export default TextInput