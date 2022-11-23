import React, { useState, useEffect } from "react";
import "./NavbarEditableTitle.scss";

type NavbarEditableTitleProps = {
  title: string;
  onSubmit: CallableFunction;
};

function NavbarEditableTitle({
  title,
  onSubmit,
}: NavbarEditableTitleProps): JSX.Element {
  const [showTitleEditInput, setShowTitleEditInput] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("");

  const onFormSubmit = (event: React.SyntheticEvent) => {
    onSubmit(currentTitle);
    setShowTitleEditInput(false);
  };

  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  return (
    <div
      className="small-navbar__project-title"
      onClick={() => setShowTitleEditInput(true)}
    >
      {showTitleEditInput ? (
        <form onSubmit={onFormSubmit}>
          <input
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            onBlur={onFormSubmit}
            autoFocus
          />
        </form>
      ) : (
        <h2 onClick={() => setShowTitleEditInput(true)}>{title}</h2>
      )}
    </div>
  );
}

export default NavbarEditableTitle;
