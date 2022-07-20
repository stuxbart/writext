import React from 'react'


function CenteredContainer({ children }) {
    const style = {
        position: "absolute ",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -60%)"
    }
    return (
    <div className='centered-container' style={style}>
        {children}
    </div>
    )
}

export default CenteredContainer