import React from "react";
import { useParams } from "react-router-dom";

function ProjectEdit() {
    let linkParams = useParams();
    
    return (
        <div>ProjectEdit {linkParams.projectId}</div>
    )
}


export default ProjectEdit;