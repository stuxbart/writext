import React from "react";


function SubmitButton({ onClick, disabled, label }) {
    return (
    <button 
            type="submit"
            className="w-100 btn btn-lg btn-primary"
            onClick={onClick}
            disabled={disabled}>
            {label}
    </button>
    )
}

export default SubmitButton