import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { fetchFolders } from '../../features/projects/folderSlice'

import FoldersList from "./FoldersList";
import FolderCreateForm from "./FolderCreateForm";


function SideFolderMenu() {
    const [showFolderForm, setShowFolderForm] = useState(false)
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchFolders())
    }, [dispatch])
    
    
    const rootFolderIds = useSelector((state) => state.folder.rootIds)
    return (<>
    <div className="card" style={{width: "22rem"}}>
        <div className="card-header pt-3">
            <h5>Foldery</h5>
        </div>
        <ul className="list-group list-group-flush">
            
            <li className="list-group-item text-white bg-green-400 btn btn-success" onClick={() => setShowFolderForm(!showFolderForm)}>
                Dodaj nowy folder
            </li>

            {showFolderForm ? (
            <li className="list-group-item">
                <FolderCreateForm />
            </li>
            ): ""}
            <li className="list-group-item">
            
            </li>
            <li className="">
            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="#">Drzewo katalogów</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Wszytkie katalogi</a>
                </li>
                {/* <li class="nav-item">
                    <a class="nav-link" href="#">Link</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link disabled">Disabled</a>
                </li> */}
            </ul>
                <FoldersList folderIds={rootFolderIds} />
            </li>
        </ul>
    </div>
    </>)
}


export default SideFolderMenu;