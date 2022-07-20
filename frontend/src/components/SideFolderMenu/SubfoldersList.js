import React from "react";
import { useSelector } from "react-redux";


function SubfoldersList({ folderIds }) {
    const folders = useSelector((state) => state.folder.entities)

    return folderIds.map((folderId) => {
        const folder = folders[folderId]

        return <li key={folderId} className="list-group-item" >
            <b>{folder.title}</b>
        </li>
    })
}

export default SubfoldersList