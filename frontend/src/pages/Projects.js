import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import { fetchProjects } from '../features/projects/projectSlice'

import SideFoldersList from '../components/SideFolderMenu'
import ProjectList from "../components/ProjectList";
import ProjectCreateForm from "../components/ProjectCreateForm";


function Projects() {
    const isAuthenticated   = useSelector((state) => state.auth.isAuthenticated)

    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    useEffect(() => {
        if (!isAuthenticated) navigate('/login');
    })

    useEffect(() => {
        dispatch(fetchProjects())
    }, [dispatch])
    

    return (<>
    <div className="container">
        <div className="row pt-5">
            <div className="col-5 border-left">
                Dodaj projekt
                
                <br/>
                
                <SideFoldersList />

            </div>
            <div className="col-7">
                <ProjectCreateForm />
                <ProjectList />

            </div>
        </div>
    </div>
    </>)
}


export default Projects