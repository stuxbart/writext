import React, { MouseEventHandler, useState } from "react";
import { IoIosMenu } from "react-icons/io";
import { Link } from "react-router-dom";
import "./NavbarMobileMenu.scss";

export enum MenuTheme {
  Dark,
  Light,
}

type NavbarMenuProps = {
  theme: MenuTheme;
  links: MenuLinkProps[];
  authLinks: MenuLinkProps[];
};

type MenuLinkProps = {
  title: string;
  to: string;
  onClick?: MouseEventHandler;
};

function NavbarMenuLink({ title, to, onClick }: MenuLinkProps): JSX.Element {
  return (
    <div className="navbar__menu_link">
      <Link replace to={to} onClick={onClick}>
        {title}
      </Link>
    </div>
  );
}

function NavbarMobileMenu({
  theme,
  links,
  authLinks,
}: NavbarMenuProps): JSX.Element {
  const [toggleMenu, setToggleMenu] = useState(false);

  const menuClass =
    theme === MenuTheme.Dark
      ? "navbar__menu_container dark__background"
      : "navbar__menu_container";

  return (
    <div className="navbar__menu">
      <div className="navbar__menu_button">
        <button onClick={() => setToggleMenu(!toggleMenu)}>
          <IoIosMenu />
        </button>
      </div>

      {toggleMenu && (
        <div className={menuClass}>
          {links.map((linkData, index) => (
            <NavbarMenuLink
              key={index}
              {...linkData}
              onClick={() => setToggleMenu(false)}
            />
          ))}

          <div className="navbar__menu-auth_container">
            {authLinks.map((linkData, index) => (
              <NavbarMenuLink
                key={index}
                {...linkData}
                onClick={() => setToggleMenu(false)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NavbarMobileMenu;
