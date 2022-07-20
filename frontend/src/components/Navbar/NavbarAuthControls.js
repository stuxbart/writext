import React from 'react';
import { Link } from 'react-router-dom'


function NavbarAuthControls({ isAuthenticated }) {
    return (
    <div className="text-end">
            {isAuthenticated ? (
            <Link replace to="/logout" type="button" className="btn btn-outline-light me-2">Logout</Link>
            ) : (
            <>
                <Link replace to="/login" type="button" className="btn btn-outline-light me-2">Login</Link>
                <Link replace to="/register" type="button" className="btn btn-warning">Sign-up</Link>
            </> )}
    </div>
    )
}


export default NavbarAuthControls