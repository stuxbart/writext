import React, { useEffect, useRef } from "react";
import {
  collapseSelectionsDown,
  collapseSelectionsToLeft,
  collapseSelectionsToRight,
  collapseSelectionsUp,
  insert,
  remove,
  selectCurrentSourceId,
  selectPositionOffset,
} from "../../../features/editor/newEditorSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import "./TextInput.scss";

type TextInputProps = {
  posX: number;
  posY: number;
  insertOffset: number;
  insertLine: number;
  onKeyDown: any;
  onKeyUp: any;
};

function TextInput({
  posX,
  posY,
  insertOffset,
  insertLine,
  onKeyDown,
  onKeyUp,
}: TextInputProps): JSX.Element {
  const sourceId = useAppSelector(selectCurrentSourceId);
  const totalOffset = useAppSelector((state) =>
    selectPositionOffset(state, insertLine, insertOffset)
  );
  const textareaRef = useRef({} as HTMLTextAreaElement);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  });

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();

    dispatch(
      insert({
        offset: totalOffset,
        str: e.target.value,
        clientId: -1,
        sourceId: sourceId,
      })
    );
  };

  const _onKeyDown = (e: React.KeyboardEvent) => {
    const capturedKeys = [
      "Backspace",
      "Tab",
      "ArrowLeft",
      "ArrowUp",
      "ArrowRight",
      "ArrowDown",
      "Delete",
    ];
    if (e.code in capturedKeys) {
      e.preventDefault();
      e.stopPropagation();
    }

    switch (e.code) {
      case "Backspace": {
        dispatch(
          remove({
            offset: totalOffset - 1,
            length: 1,
            clientId: -1,
            sourceId: sourceId,
          })
        );
        break;
      }
      case "Tab": {
        //insert 4 spaces instead
        dispatch(
          insert({
            offset: totalOffset,
            str: "    ",
            clientId: -1,
            sourceId: sourceId,
          })
        );
        break;
      }
      case "ArrowLeft": {
        dispatch(collapseSelectionsToLeft());
        break;
      }
      case "ArrowUp": {
        dispatch(collapseSelectionsUp());
        break;
      }
      case "ArrowRight": {
        dispatch(collapseSelectionsToRight());
        break;
      }
      case "ArrowDown": {
        dispatch(collapseSelectionsDown());
        break;
      }
      case "Delete": {
        dispatch(
          remove({
            offset: totalOffset,
            length: 1,
            clientId: -1,
            sourceId: sourceId,
          })
        );
        break;
      }
      default: {
        break;
      }
    }
    onKeyDown(e);
  };

  const _onKeyUp = (e: React.KeyboardEvent) => {
    onKeyUp(e);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    if (!e.clipboardData) {
      return;
    }
    const text = e.clipboardData.getData("text");
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      insert({
        offset: totalOffset,
        str: text,
        clientId: -1,
        sourceId: sourceId,
      })
    );
  };

  const inputStyle: React.CSSProperties = {
    top: posY,
    left: posX,
  };
  return (
    <textarea
      ref={textareaRef}
      id="editor-text-input"
      className="editor__text-input"
      value=""
      onChange={onChange}
      onKeyDown={_onKeyDown}
      onKeyUp={_onKeyUp}
      onPaste={onPaste}
      style={inputStyle}
    />
  );
}

export default TextInput;
