import React from "react";
import { Link } from "react-router-dom";
import "./Footer.scss";

type LinkData = {
  title: string;
  to: string;
};

const links1 = [
  {
    title: "Lorem Ipsum",
    to: "#",
  },
  {
    title: "Lorem Ipsum",
    to: "#",
  },
  {
    title: "Lorem Ipsum",
    to: "#",
  },
  {
    title: "Lorem Ipsum",
    to: "#",
  },
];

const links2 = [
  {
    title: "Lorem Ipsum",
    to: "#",
  },
  {
    title: "Lorem Ipsum",
    to: "#",
  },
  {
    title: "Lorem Ipsum",
    to: "#",
  },
  {
    title: "Lorem Ipsum",
    to: "#",
  },
];

function Footer(): JSX.Element {
  const renderLinks = (links: LinkData[]) => {
    return links.map((item, index) => (
      <li key={index}>
        <Link replace to={item.to} className="footer__link">
          {item.title}
        </Link>
      </li>
    ));
  };

  return (
    <div className="footer dark__background">
      <div className="footer__container">
        <div className="footer__links">
          <div className="footer__links_container">
            <ul>{renderLinks(links1)}</ul>
          </div>

          <div className="footer__links_container">
            <ul>{renderLinks(links2)}</ul>
          </div>
        </div>
        <div className="footer__copyright">
          <p>© Writext 2022</p>
        </div>
      </div>
    </div>
  );
}

export default Footer;
