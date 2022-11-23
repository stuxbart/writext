import React, { useState } from "react";
import {
  selectEditorMAxVisibleLines,
  selectEditorStyle,
  selectFirstVisibleLineIndex,
  selectSelections,
  selectTotalLinesCount,
  setSelection,
  SelectionData,
  extendLastSelection,
  addSelection,
  selectLines,
  updateLastSelection,
  SelectionType,
  addEntireFileSelection,
} from "../../../features/editor/newEditorSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import Cursor from "../Cursor";
import TextInput from "../TextInput";
import SelectionDiv from "./SelectionDiv";
import "./SelectionLayer.scss";

type ScreenPoint = {
  x: number;
  y: number;
};

function SelectionLayer(): JSX.Element {
  const [isSelecting, setIsSelecting] = useState(false);
  const [shiftHold, setShiftHold] = useState(false);
  const [ctrlHold, setCtrlHold] = useState(false);
  const [altHold, setAltHold] = useState(false);
  const [rightAltHold, setRightAltHold] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 } as ScreenPoint);

  const editorStyle = useAppSelector(selectEditorStyle);
  const linesCount = useAppSelector(selectTotalLinesCount);
  const selections = useAppSelector(selectSelections);
  const visibleLinesCount = useAppSelector(selectEditorMAxVisibleLines);
  const firstVisibleLineIndex = useAppSelector(selectFirstVisibleLineIndex);
  const lines = useAppSelector((state) =>
    selectLines(state, visibleLinesCount)
  );
  const linesLength = lines.map((line) => line.length);
  const dispatch = useAppDispatch();

  const onMouseUp = (e: React.MouseEvent) => {
    setIsSelecting(false);
  };

  function onMouseDown(e: React.MouseEvent) {
    if (e.button === 0) {
      const sourceRect = e.currentTarget.getClientRects()[0];
      const point: ScreenPoint = {
        x: Math.round(
          (e.clientX - sourceRect.left - 15) / editorStyle.letterWidth
        ),
        y: Math.floor((e.clientY - sourceRect.top) / editorStyle.lineHeight),
      };
      const mySelection: SelectionData = {
        type: SelectionType.N,
        start: {
          line: point.y,
          offset: point.x,
          totalOffset: 0,
        },
        end: {
          line: point.y,
          offset: point.x,
          totalOffset: 0,
        },
      };
      if (
        linesLength[mySelection.start.line - firstVisibleLineIndex] <
        mySelection.start.offset
      ) {
        mySelection.start.offset =
          linesLength[mySelection.start.line - firstVisibleLineIndex];
      }
      if (
        linesLength[mySelection.end.line - firstVisibleLineIndex] <
        mySelection.end.offset
      ) {
        mySelection.end.offset =
          linesLength[mySelection.end.line - firstVisibleLineIndex];
      }
      if (shiftHold) {
        dispatch(extendLastSelection(mySelection.start));
      } else if (ctrlHold) {
        dispatch(addSelection(mySelection));
      } else {
        dispatch(setSelection(mySelection));
      }
      setIsSelecting(true);
    }
  }

  function onMouseMove(e: React.MouseEvent) {
    const sourceRect = e.currentTarget.getClientRects()[0];
    const mPos: ScreenPoint = {
      x: e.clientX - sourceRect.left - 15,
      y: e.clientY - sourceRect.top,
    };

    if (isSelecting) {
      const point: ScreenPoint = {
        x: Math.round(mPos.x / editorStyle.letterWidth),
        y: Math.floor(mPos.y / editorStyle.lineHeight),
      };
      if (linesLength[point.y - firstVisibleLineIndex] < point.x) {
        point.x = linesLength[point.y - firstVisibleLineIndex];
      }
      dispatch(
        updateLastSelection({
          line: point.y,
          offset: point.x,
          totalOffset: 0,
        })
      );
    }
    setMousePos(mPos);
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.code) {
      case "ShiftLeft":
        setShiftHold(true);
        break;
      case "ControlLeft":
        setCtrlHold(true);
        break;
      case "AltLeft":
        setAltHold(true);
        break;
      case "KeyA":
        if (ctrlHold && !rightAltHold) {
          dispatch(addEntireFileSelection());
        }
        break;
      case "AltRight":
        setRightAltHold(true);
        break;
      default:
        break;
    }
  };

  function onKeyUp(e: React.KeyboardEvent) {
    switch (e.code) {
      case "ShiftLeft":
        setShiftHold(false);
        break;
      case "ControlLeft":
        setCtrlHold(false);
        break;
      case "AltLeft":
        setAltHold(false);
        break;
      case "AltRight":
        setRightAltHold(false);
        break;
      default:
        break;
    }
  }

  function renderCursors() {
    return selections.map((sel, index) => {
      if (sel.type === SelectionType.L) {
        return (
          <Cursor key={index} line={sel.start.line} offset={sel.start.offset} />
        );
      } else {
        return (
          <Cursor key={index} line={sel.end.line} offset={sel.end.offset} />
        );
      }
    });
  }

  function renderSelctions() {
    let selectionsDivs = [];
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];

      if (
        selection.start.line !== selection.end.line ||
        selection.start.offset !== selection.end.offset
      ) {
        selectionsDivs.push(<SelectionDiv key={i} selection={selection} />);
      }
    }
    return selectionsDivs;
  }

  const style: React.CSSProperties = {
    height: linesCount * editorStyle.lineHeight + "px",
    // width: editorStyle.width - editorStyle.gutterWidth + "px",
    width: "10000px",
    position: "absolute",
    left: editorStyle.gutterWidth + "px",
    top: "0px",
  };

  return (
    <div
      className="editor__selection-layer"
      style={style}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseDown={onMouseDown}
    >
      <TextInput
        posX={mousePos.x}
        posY={mousePos.y}
        insertOffset={selections[selections.length - 1].end.offset}
        insertLine={selections[selections.length - 1].end.line}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
      />
      {renderCursors()}
      {renderSelctions()}
    </div>
  );
}

export default SelectionLayer;
