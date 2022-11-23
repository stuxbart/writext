import React from "react";
import { Link } from "react-router-dom";
import "./NavbarLink.scss";

export enum NavbarLinkType {
  Link,
  ExternalLink,
  Button,
}

function NavbarLink(props: any): JSX.Element {
  const type = props.type;
  const children = props.children;

  switch (type) {
    case NavbarLinkType.Link: {
      return (
        <div className="small-navbar__links_link">
          <Link {...props}>{children}</Link>
        </div>
      );
    }
    case NavbarLinkType.ExternalLink: {
      return (
        <div className="small-navbar__links_link">
          <a {...props}></a>
        </div>
      );
    }
    case NavbarLinkType.Button: {
      return (
        <div className="small-navbar__links_link">
          <button {...props}>{children}</button>
        </div>
      );
    }
    default:
      break;
  }
  return <></>;
}

export default NavbarLink;
