import React from "react";
import { Link } from "react-router-dom"
import CenteredContainer from '../components/CenteredContainer.js'

function Error404() {

    return (
    <CenteredContainer>
    <div className="card" style={{width: "30rem", alignItems: "center", padding: "200px 0px"}}>    
        <div className="card-body">
          <h1 className="card-title">Error 404</h1>
          <p className="card-text">Nie znaleziono wybranej strony.</p>
        </div>
        <div className="card-body">
          <Link to="/" className="card-link">Wróć do strony głównej</Link>
        </div>
    </div>
    </CenteredContainer>
    )
}

export default Error404;