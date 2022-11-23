import React, { useEffect } from "react";
import { selectEditorStyle } from "../../../features/editor/newEditorSlice";
import { useAppSelector } from "../../../hooks";
import "./Cursor.scss";

type CursorProps = {
  line: number;
  offset: number;
};

function Cursor({ line, offset }: CursorProps): JSX.Element {
  const editorStyle = useAppSelector(selectEditorStyle);
  const cursorStyle = {
    left: "calc(15px + " + editorStyle.letterWidth * offset + "px)",
    top: line * editorStyle.lineHeight + "px",
  };

  useEffect(() => {
    const cursors = document.getElementsByClassName(
      "editor__cursor editor__cursor--animated"
    );
    for (const cursor of cursors) {
      const anims = cursor.getAnimations();
      for (const anim of anims) {
        anim.currentTime = 0;
      }
    }
  }, [line, offset]);

  return (
    <div
      className="editor__cursor editor__cursor--animated"
      style={cursorStyle}
    ></div>
  );
}

export default Cursor;
