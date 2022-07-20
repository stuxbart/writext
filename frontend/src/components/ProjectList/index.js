import React from "react";
import { useSelector } from 'react-redux'

import FolderPathBreadcrumb from '../FolderPathBreadcrumb'
import ProjectListItem from "./ProjectListItem";
  

function ProjectList() {
    const projects          = useSelector((state) => state.project.entities)
    const projectsIds       = useSelector((state) => state.project.allIds)    
    const selectedFolderId  = useSelector((state) => state.folder.selectedFolderId)
    const folder            = useSelector((state) => state.folder.entities[selectedFolderId])

    const isListEmpty = projectsIds.length === 0
    const isFolderEmpty = folder && folder.projects.length === 0

    if (isListEmpty && !selectedFolderId)
    return (
        <>
            <h2>Lista projektów</h2><hr/>
            <h4>Nie masz jeszcze zadnych projektów :(</h4>
            <p>Dodaj nowy projekt klikajac tutaj</p>
        </>)

    return (
    <>
        <h2>Lista projektów</h2><hr/>
        <FolderPathBreadcrumb />
        <hr/>
        <ul className="list-group list-group-flush">
            {isFolderEmpty ? 
            <>
            <h4>Nie masz jeszcze zadnych projektów w tym folderze :(</h4>
            <p>Dodaj nowy projekt klikajac tutaj</p>
            </>
             : folder ?
            folder.projects.map(projectId => <ProjectListItem key={projectId} project={projects[projectId]}/>)
            :   projectsIds.map(projectId => <ProjectListItem key={projectId} project={projects[projectId]}/>)
            }
        </ul>
    </>)
}


export default ProjectList