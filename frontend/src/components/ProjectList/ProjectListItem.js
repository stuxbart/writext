import React from "react";


function ProjectListItem({ project }) {
    
    return (
    <li className="list-group-item d-flex justify-content-between align-items-start" >
        <div className="ms-2 me-auto">
        <div className="fw-bold">{project.title}</div>
        {project.updated}
        </div>
        <span>
        {project.newChanges ? <><span className="badge bg-primary rounded-pill">Nowe zmiany</span><br/></> : "" }
        {project.todo ? <span className="badge bg-warning rounded-pill w-100">Do zrobienia</span> : "" }
        </span>
    </li>
    )
}


export default ProjectListItem