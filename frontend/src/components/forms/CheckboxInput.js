import React from "react"

function CheckboxInput({ name, value, onChange, label }){

    return (
        <div className="checkbox mb-3">
        <label>
            <input 
                type="checkbox" 
                name={name} 
                value={value} 
                checked={value} 
                onChange={onChange}/>
            {label}
        </label>
    </div>
    )
}

export default CheckboxInput