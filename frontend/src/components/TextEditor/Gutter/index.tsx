import React from "react";
import {
  selectGutterProps,
  selectTotalLinesCount,
} from "../../../features/editor/newEditorSlice";
import { useAppSelector } from "../../../hooks";
import "./Gutter.scss";

function Gutter(): JSX.Element {
  const [gutterWidth, firstVisibleLine, visibleLinesCount] =
    useAppSelector(selectGutterProps);
  const sourceNewLinesCount = useAppSelector(selectTotalLinesCount);

  const numbers = [];
  const visibleLines = Math.min(
    sourceNewLinesCount - firstVisibleLine,
    visibleLinesCount
  );

  for (let i = 0; i < visibleLines; i++) {
    const lineNumber = firstVisibleLine + i;
    numbers.push(
      <GutterNumber key={lineNumber} lineNumber={lineNumber + 1}></GutterNumber>
    );
  }

  const gutterStyle: React.CSSProperties = {
    position: "absolute",
    top: firstVisibleLine * 22 + "px",
    width: gutterWidth + "px",
  };

  return (
    <div className="editor__gutter" style={gutterStyle}>
      {numbers}
    </div>
  );
}

export default Gutter;

type GutterNumberProps = {
  lineNumber: number;
};

function GutterNumber({ lineNumber }: GutterNumberProps): JSX.Element {
  return <div className="editor__text-multi-line-number">{lineNumber}</div>;
}
