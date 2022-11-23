import React, { MouseEventHandler, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { Link } from "react-router-dom";

import "./NavbarMenu.scss";

type MenuLinkProps = {
  to: string;
  title: string;
  onClick?: MouseEventHandler;
};

type NavbarMenuProps = {
  show: boolean;
  title: string;
  links: MenuLinkProps[];
};

function NavbarMenuLink(props: MenuLinkProps): JSX.Element {
  return (
    <div className="small-navbar__menu_link">
      <Link replace to={props.to} onClick={props.onClick}>
        {props.title}
      </Link>
    </div>
  );
}

function NavbarMenu({ show, title, links }: NavbarMenuProps): JSX.Element {
  const [toggleUserMenu, setToggleUserMenu] = useState(false);

  if (!show) {
    return <></>;
  }

  return (
    <div className="small-navbar__menu">
      <div className="small-navbar__menu_button">
        <button onClick={() => setToggleUserMenu(!toggleUserMenu)}>
          {title}&nbsp;
          <IoIosArrowDown />
        </button>
      </div>

      {toggleUserMenu && (
        <div className="small-navbar__menu_container">
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
