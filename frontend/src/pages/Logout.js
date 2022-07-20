import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom'
import { logout } from "../features/auth/authSlice";


function Logout() {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
    const isLoading = useSelector((state) => state.auth.loading)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    
    useEffect(() => {
        if (isAuthenticated)
            dispatch(logout())
        navigate("/")
    })
        
    if (isLoading) {
        return <div>
            Loading...
        </div>
    }
    return 
}

export default Logout;