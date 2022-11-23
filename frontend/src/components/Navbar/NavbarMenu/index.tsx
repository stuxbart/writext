import React, { MouseEventHandler, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { Link } from "react-router-dom";
import "./NavbarMenu.scss";

export enum MenuTheme {
  Dark,
  Light,
}

type NavbarMenuProps = {
  title: string;
  theme: MenuTheme;
  links: MenuLinkProps[];
  show?: boolean;
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

function NavbarMenu({
  title,
  theme,
  links,
  show = true,
}: NavbarMenuProps): JSX.Element {
  const [toggleUserMenu, setToggleUserMenu] = useState(false);

  const menuClass =
    theme === MenuTheme.Dark
      ? "navbar__menu_container dark__background"
      : "navbar__menu_container";

  if (!show) {
    return <></>;
  }

  return (
    <div className="navbar__auth">
      <div className="navbar__menu_button">
        <button onClick={() => setToggleUserMenu(!toggleUserMenu)}>
          {title}&nbsp;
          <IoIosArrowDown />
        </button>
      </div>

      {toggleUserMenu && (
        <div className={menuClass}>
          {links.map((linkData, index) => (
            <NavbarMenuLink
              key={index}
              {...linkData}
              onClick={() => setToggleUserMenu(false)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default NavbarMenu;
