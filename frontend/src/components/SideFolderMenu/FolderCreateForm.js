import React, { useState } from "react";
import { useDispatch } from 'react-redux'
import { createFolder, fetchFolders } from '../../features/projects/folderSlice'


function FolderCreateForm() {
    const [newFolderTitle, setNewFolderTitle] = useState('')
    const dispatch = useDispatch();

    const onFolderCreate = async () => {
        await dispatch(createFolder(newFolderTitle))
        setNewFolderTitle('')
        await dispatch(fetchFolders())
    }
    
    const canSubmit = () => newFolderTitle !== ''
    return (
    <div className="input-group">
        <input 
            type="text" 
            className="form-control" 
            id="newFolderTitle" 
            placeholder="Nazwa nowego folderu"
            value={newFolderTitle}
            onChange={e => setNewFolderTitle(e.target.value)}
        />
        <button 
            className="btn btn-success" 
            type="button" 
            id="button-addon1"
            onClick={onFolderCreate}
            disabled={!canSubmit()}
        >  Dodaj </button>
    </div>
    )
}

export default FolderCreateForm