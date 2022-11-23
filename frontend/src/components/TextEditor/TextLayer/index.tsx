import React from "react";
import {
  selectEditorStyle,
  selectLines,
  selectEditorMAxVisibleLines,
  selectFirstVisibleLineIndex,
} from "../../../features/editor/newEditorSlice";
import { useAppSelector } from "../../../hooks";

import "./TextLayer.scss";
import TextLine from "./TextLine";

function TextLayer(): JSX.Element {
  const editorStyle = useAppSelector(selectEditorStyle);
  const visibleLinesCount = useAppSelector(selectEditorMAxVisibleLines);
  const firstVisibleLine = useAppSelector(selectFirstVisibleLineIndex);
  const lines = useAppSelector((state) =>
    selectLines(state, visibleLinesCount)
  );

  const renderLines = () => {
    let offset = 0;
    let renderedLines: JSX.Element[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineLength = line.length;
      const lineObj = (
        <TextLine
          key={i + firstVisibleLine}
          text={line}
          index={i + firstVisibleLine}
          textOffset={offset + firstVisibleLine + i}
          isSelected={false}
        />
      );

      renderedLines.push(lineObj);
      offset += lineLength;
    }
    return renderedLines;
  };

  const sourceStyle: React.CSSProperties = {
    lineHeight: "22px",
    position: "absolute",
    left: editorStyle.gutterWidth,
    top: firstVisibleLine * 22 + "px",
    padding: "0em 0em",
    fontFamily: editorStyle.fontFamily,
    userSelect: "none",
  };

  return (
    <div
      id="source"
      style={sourceStyle}
      className="editor__text-layer editor__text-editor-source--default-style"
    >
      {renderLines()}
    </div>
  );
}

export default TextLayer;
