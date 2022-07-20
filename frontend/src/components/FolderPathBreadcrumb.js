import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { deselectFolder } from '../features/projects/folderSlice'

function FolderPathBreadcrumb() {
    const dispatch = useDispatch()
    const folders = useSelector((state) => state.folder.entities)
    const selectedFolderId = useSelector((state) => state.folder.selectedFolderId)
    
    let currentFolderId = selectedFolderId
    let folderIds = []

    while (currentFolderId) {
        folderIds.push(currentFolderId)
        let nextFolder = folders[currentFolderId]
        currentFolderId = nextFolder.parent_group
    }

    folderIds = folderIds.reverse()
    
    return (
    <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
            <li className="breadcrumb-item"><a role="button" onClick={e => dispatch(deselectFolder())}>Home</a></li>
            {selectedFolderId ? folderIds.map(folderId => {
                const folder = folders[folderId]
                return <li key={folderId} className="breadcrumb-item active" aria-current="page">{folder.title}</li> //
            }) : ""}
            
        </ol>
    </nav>
    )
}


export default FolderPathBreadcrumb