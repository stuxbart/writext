import React from "react";
import { selectEditorStyle } from "../../../../features/editor/newEditorSlice";
import { useAppSelector } from "../../../../hooks";

import "./TextLine.scss";

enum formatTypes {
  text = "text",
  command = "command",
  commandArg = "commandArg",
  comment = "comment",
}

type TextLineProps = {
  text: string;
  index: number;
  textOffset: number;
  isSelected: boolean;
};

function TextLine({
  text,
  index,
  textOffset,
  isSelected,
}: TextLineProps): JSX.Element {
  const editorStyle = useAppSelector(selectEditorStyle);
  let isCommand = false;
  let isCommandArg = false;
  let isComment = false;
  let result = [];
  let tmpstr = "";

  let i = 0;
  let elementKey = 0;
  for (i = 0; i < text.length; i++) {
    const element = text[i];

    if (element === "\\") {
      result.push(
        <FormattedText key={elementKey} formatType={formatTypes.text}>
          {tmpstr}
        </FormattedText>
      );
      elementKey += 1;
      tmpstr = "\\";
      isCommand = true;
    } else if (element === " ") {
      if (isCommand) {
        result.push(
          <FormattedText key={elementKey} formatType={formatTypes.command}>
            {tmpstr}
          </FormattedText>
        );
        elementKey += 1;
        isCommand = false;
        tmpstr = " ";
      } else {
        tmpstr += " ";
      }
    } else if (element === "{") {
      if (isCommand) {
        isCommand = false;
        result.push(
          <FormattedText key={elementKey} formatType={formatTypes.command}>
            {tmpstr}
          </FormattedText>
        );
        elementKey += 1;
        tmpstr = "{";
      } else {
        tmpstr += "{";
      }
    } else if (element === "}") {
      tmpstr += "}";
    } else if (element === "[") {
      if (isCommand) {
        isCommand = false;
        result.push(
          <FormattedText key={elementKey} formatType={formatTypes.command}>
            {tmpstr}
          </FormattedText>
        );
        elementKey += 1;
        tmpstr = "[";
        isCommandArg = true;
      } else {
        tmpstr += "[";
      }
    } else if (element === "]") {
      if (isCommandArg) {
        isCommandArg = false;
        tmpstr += "]";
        result.push(
          <FormattedText key={elementKey} formatType={formatTypes.commandArg}>
            {tmpstr}
          </FormattedText>
        );
        elementKey += 1;
        tmpstr = "";
      } else {
        tmpstr += "]";
      }
    } else if (element === "%") {
      if (isCommandArg) {
        isCommandArg = false;
        result.push(
          <FormattedText key={elementKey} formatType={formatTypes.commandArg}>
            {tmpstr}
          </FormattedText>
        );
        elementKey += 1;
      } else if (isCommand) {
        isCommand = false;
        result.push(
          <FormattedText key={elementKey} formatType={formatTypes.command}>
            {tmpstr}
          </FormattedText>
        );
        elementKey += 1;
      } else {
        isComment = true;
      }
      tmpstr = "%";
    } else if (element === "\n") {
      if (isComment) {
        isComment = false;
        result.push(
          <FormattedText key={elementKey} formatType={formatTypes.comment}>
            {tmpstr}
          </FormattedText>
        );
        elementKey += 1;
        tmpstr = "\n";
      }
    } else {
      tmpstr += element;
    }
  }

  if (tmpstr.length > 0) {
    if (isCommand) {
      result.push(
        <FormattedText key={elementKey} formatType={formatTypes.command}>
          {tmpstr}
        </FormattedText>
      );
      elementKey += 1;
      isCommand = false;
      tmpstr = " ";
    } else if (isComment) {
      result.push(
        <FormattedText key={elementKey} formatType={formatTypes.comment}>
          {tmpstr}
        </FormattedText>
      );
      elementKey += 1;
      isComment = false;
      tmpstr = " ";
    } else {
      result.push(
        <FormattedText key={elementKey} formatType={formatTypes.text}>
          {tmpstr}
        </FormattedText>
      );
      elementKey += 1;
    }
  }

  const style: React.CSSProperties = {
    backgroundColor: isSelected ? "rgb(35, 114, 217)" : "none",
    color: isSelected ? "white" : "black",
    padding: "0px 0px 0px " + editorStyle.leftPadding + "px",
    width: "10000px",
  };

  return (
    <div className="editor__text-multi-line" key={index}>
      <div
        className="editor__text-multi-line_content"
        id={`line-${index}`}
        data-length={text.length}
        data-offset={textOffset}
        style={style}
      >
        {result || <br />}
      </div>
    </div>
  );
}
export default TextLine;

type FormattedTextProps = {
  children: any;
  formatType: formatTypes;
};

function FormattedText({
  children,
  formatType,
}: FormattedTextProps): JSX.Element {
  let className = "";

  switch (formatType) {
    case formatTypes.text:
      className = "format__text";
      break;
    case formatTypes.command:
      className = "format__command";
      break;
    case formatTypes.commandArg:
      className = "format__command-arg";
      break;
    case formatTypes.comment:
      className = "format__comment";
      break;

    default:
      className = "format__text";
      break;
  }
  return <span className={className}>{children}</span>;
}
