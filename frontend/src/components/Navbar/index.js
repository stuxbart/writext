import React from 'react';
import { useSelector } from 'react-redux'

import NavbarLogo from './NavbarLogo';
import NavbarLinks from './NavbarLinks';
import NavbarAuthControls from './NavbarAuthControls';
import ErrorBar from './ErrorBar';
import SearchBar from './SearchBar';

function Navbar() {
    const isAuthenticated   = useSelector((state) => state.auth.isAuthenticated)
    const isErrorSet        = useSelector((state) => state.error.isSet)
    const errorMessage      = useSelector((state) => state.error.errorMessage)    

    return (
    <header>
        <div className="p-3 bg-dark text-white">
            <div className="container">
                <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                    <NavbarLogo />
                    <NavbarLinks isAuthenticated={isAuthenticated} />
                    <SearchBar />
                    <NavbarAuthControls isAuthenticated={isAuthenticated} />
                </div>
            </div>
        </div>

        <ErrorBar errMessage={errorMessage} show={isErrorSet}/>

    </header>
    )
}

export default Navbar;