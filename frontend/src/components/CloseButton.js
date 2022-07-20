import React from "react"

function CloseButton({ onClick }) {
    const style = {
        right: "5%", 
        position: "absolute", 
        outline: "none"
    }
    
    return (
    <button 
        type="button" 
        className="btn-close pt-3 px-2" 
        data-bs-dismiss="alert" 
        aria-label="Close" 
        style={style}
        onClick={onClick}
        ></button>
    )
}

export default CloseButton