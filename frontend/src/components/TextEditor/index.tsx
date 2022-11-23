import React, { useEffect, useRef } from "react";
import {
  setEditorSize,
  setScrollOffset,
  selectTotalLinesCount,
  setFontFamily,
} from "../../features/editor/newEditorSlice";
import { useAppDispatch, useAppSelector } from "../../hooks";
import SelectionLayer from "./SelectionLayer";
import TextLayer from "./TextLayer";
import "./TextEditor.scss";
import Gutter from "./Gutter";

function TextEditor(): JSX.Element {
  const dispatch = useAppDispatch();
  const linesCount = useAppSelector(selectTotalLinesCount);
  const sourceContainerRef = useRef({} as HTMLDivElement);

  const onResize = (e: UIEvent | undefined) => {
    const screenWidth = window.screen.width;
    const editorDiv = sourceContainerRef.current;
    const height = editorDiv.getClientRects()[0].height || 100;
    dispatch(setEditorSize((screenWidth - 290) / 2, height));
  };

  const onScroll = (e: React.UIEvent) => {
    const scrollOffset = e.currentTarget.scrollTop;
    dispatch(setScrollOffset(scrollOffset));
  };

  useEffect(() => {
    onResize(undefined);
    dispatch(setFontFamily("Source Code Pro, monospace"));
    window.addEventListener("resize", onResize, false);

    return () => {
      window.removeEventListener("resize", onResize, false);
    };
  }, [dispatch]);

  const sourceWrapperStyle: React.CSSProperties = {
    height: linesCount * 22 + "px",
  };

  return (
    <div className="editor__text-editor_container">
      <div
        ref={sourceContainerRef}
        id="source-container"
        className="editor__source-container"
        onScroll={onScroll}
      >
        <div
          id="source-wrapper"
          className="editor__text-editor-source-wrapper"
          style={sourceWrapperStyle}
        >
          <Gutter />
          <SelectionLayer />
          <TextLayer />
        </div>
      </div>
    </div>
  );
}

export default TextEditor;
