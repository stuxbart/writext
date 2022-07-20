import React from 'react';
import { Link } from 'react-router-dom'


function NavbarLogo() {
    return (
    <Link replace to="/" className="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none">
        <svg className="bi me-2" width="40" height="32" role="img" aria-label="Bootstrap"></svg> {/*<use xlink:href="#bootstrap"></use>*/}
    </Link>
    )
}

export default NavbarLogo