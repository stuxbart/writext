import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectFolder } from '../../features/projects/folderSlice'


function FolderListItem({ folder }){
    const [expanded, setExpanded] = useState(false)
    const dispatch = useDispatch()
    const selectedFolderId = useSelector((state) => state.folder.selectedFolderId)


    const hasChildFolders = folder.child_groups.length > 0
    const selected = folder.id === selectedFolderId

    const onClick = (e) => {
        setExpanded(!expanded)
        dispatch(selectFolder(folder.id))
    }

    const linkStyle = {
        textDecoration: "none",
        color: "black"
    }

    const countOfSubfolders = folder.child_groups.length
    const countOfProjects = folder.projects.length
    return (
    <li>
        <a role="button" onClick={onClick} className={selected ? "text-warning" : ""} style={linkStyle}><b>{folder.title}({countOfSubfolders}/{countOfProjects})</b></a>
        {hasChildFolders ? (
            <div className={expanded ? "collapse show" : "collapse"}>
                <FoldersList folderIds={folder.child_groups} />
            </div>
        ) : (
            ""
        ) }
    </li>
    )
}


function FoldersList({ folderIds }) {
    const folders = useSelector((state) => state.folder.entities)

    return (<ul>{
        folderIds.map(rootFolderId => <FolderListItem key={rootFolderId} folder={folders[rootFolderId]}/> )
    }</ul>)
}


export default FoldersList