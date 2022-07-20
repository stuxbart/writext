import React from 'react';
import { Link } from 'react-router-dom'


function NavbarLink({ to, title, active=false}) {
    return (
    <li>
        <Link to={to} replace className={`nav-link px-2 ${active ? "text-secondary" : "text-white"}`}>
            {title}
        </Link>
    </li>
    )
}


function NavbarLinks({ isAuthenticated }) {
    return (
    <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
        <NavbarLink to={isAuthenticated ? "/projects" : "/"} title="Home" active />
        <NavbarLink to="/features" title="Features" />
        <NavbarLink to="/pricing" title="Pricing" />
        <NavbarLink to="/faqs" title="FAQs" />
        <NavbarLink to="/about" title="About" />
    </ul>
    )
}


export default NavbarLinks