import React from "react";
import CenteredContainer from './CenteredContainer'

function LoadingSpinner() {
    return (
    <CenteredContainer>
    <div className="spinner-border" style={{width: "8rem", height: "8rem"}} role="status">
        <span className="visually-hidden">Loading...</span>
    </div>
    </CenteredContainer>
    )
}

export default LoadingSpinner