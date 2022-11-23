import React, { CSSProperties } from "react";
import {
  selectEditorStyle,
  SelectionData,
} from "../../../features/editor/newEditorSlice";
import { useAppSelector } from "../../../hooks";
import "./SelectionLayer.scss";

type SelectionDivProps = {
  selection: SelectionData;
};

function SelectionDiv({ selection }: SelectionDivProps) {
  const editorStyle = useAppSelector(selectEditorStyle);
  let lines = [];

  for (let i = selection.start.line; i < selection.end.line + 1; i++) {
    let width = 0;
    if (i === selection.end.line) {
      width = selection.end.offset * editorStyle.letterWidth;
    }
    if (i === selection.start.line) {
      width -= selection.start.offset * editorStyle.letterWidth;
    }

    const lineStyle: CSSProperties = {
      top: i * editorStyle.lineHeight + "px",
      left:
        i === selection.start.line
          ? selection.start.offset * editorStyle.letterWidth +
            editorStyle.leftPadding +
            "px"
          : editorStyle.leftPadding + "px",
      height: editorStyle.lineHeight + "px",
      width: i === selection.end.line ? width + "px" : "100%",
    };
    lines.push(
      <div key={i} className="editor__selection" style={lineStyle}></div>
    );
  }
  return <>{lines}</>;
}

export default SelectionDiv;
