import { createAsyncThunk, createSlice, createAction } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import getCookie from "../../api/csrf";
import { editorEndpoint } from "../../api/endpoints";
import {
  fetchProject,
  FullProjectEntity,
  ProjectEntity,
  updateProject,
} from "../projects/projectSlice";
import { AxiosRequestConfig } from "axios";

const MAX_BUFFER_SIZE: number = 2000;

// Source is represented by piece table.
export type Piece = {
  bufferIndex: number; // index of buffer storing content
  offset: number; // offset of text in buffer
  length: number; // length of text in buffer
  firstNewLine: number; // index of first new line in buffer
  newLines: number; // count of new lines in buffer
};
export enum ErrorCodes {
  WRONG_SOURCE_ID,
}
// Data required to insert text into source
export type InsertPayload = {
  offset: number;
  str: string;
  clientId: number;
  sourceId: number;
};
// Data required to delete text from source
export type RemovePayload = {
  offset: number;
  length: number;
  clientId: number;
  sourceId: number;
};
// Used to represent cursors of other clients
export type Cursor = {
  clientId: number;
  offset: number;
  name?: string;
  sourceId: number;
};
// Type used to represent important points in text
export type Marker = {
  offset: number;
  info: string;
  color: string;
};
// Connection state
export type Socket = {
  isConnected: boolean;
  endpoint: string;
};
export type Error = {
  code: ErrorCodes;
  msg: string;
};
export type Buffer = {
  content: string;
  newLines: number[];
  size: number;
};
export type Version = {
  ver: number;
  prev?: number;
  next?: number;
  rootID: number;
};
export type Versions = {
  [index: number]: Version;
};
export type Source = {
  id: number;
  name: string;
  totalSize: number; // length of entire string
  totalNewLines: number;

  pieces: Piece[];
  piecesCount: number;

  buffers: Buffer[];
  buffersCount: number;

  versions: Versions;
  version: number;

  markers: Marker[];
  lastEditOffset: number;
  lastEditClientId: number;
  lastEditPieceNumber: number;
};

export type SourceMeta = {
  id: number;
  name: string;
};

export type Sources = {
  [index: number]: Source;
};
export type MediaFile = {
  id: number;
  name: string;
  file: string;
};
export type MediaFiles = {
  [index: number]: MediaFile;
};
export type CreateSourceData = {
  projectId: string;
  filename: string;
};

export type LoadingStates = {
  editor: boolean;
  createSource: boolean;
  uploadFile: boolean;
};
export enum SelectionType {
  L, // left
  R, // rigt
  N, // not specified
}
export type Point = {
  line: number;
  offset: number;
  totalOffset: number;
};
export type SelectionData = {
  type: SelectionType;
  start: Point;
  end: Point;
};
export enum CompileStatus {
  InProgress = "inprogress",
  Ready = "ready",
  Error = "error",
}
export type Compile = {
  resultLink: string;
  status: CompileStatus;
  error: string;
};
export type CompileResult = {
  link: string;
  error: string;
};
// Editor style variables
export type EditorStyle = {
  height: number;
  width: number;
  lineHeight: number;
  lineWidth: number;
  fontSize: number;
  fontFamily: string;
  letterWidth: number;
  maxVisibleLinesCount: number;
  maxLineCharacters: number;
  firstVisibleLine: number;
  scrollOffset: number;
  gutterWidth: number;
  leftPadding: number;
};
export type EditorState = {
  projectId?: string;
  clientId: number;
  projectTitle: string;
  loading: LoadingStates;
  cursors: Cursor[];
  sources: Sources;
  currentSourceId: number;
  selections: SelectionData[];

  style: EditorStyle;
  socket: Socket;
  errors: Error[];
  compile: Compile;
  mediaFiles: MediaFiles;
};

const initialState: EditorState = {
  projectId: undefined,
  clientId: -1,
  projectTitle: "",

  loading: {
    editor: true,
    createSource: false,
    uploadFile: false,
  },
  cursors: [],
  sources: {},
  currentSourceId: -1,
  selections: [],

  style: {
    width: 500,
    height: 500,
    lineHeight: 22,
    fontSize: 16,
    fontFamily: "Source Code Pro",
    letterWidth: 0,
    lineWidth: 450,
    maxVisibleLinesCount: 23,
    maxLineCharacters: 10000,
    firstVisibleLine: 0,
    scrollOffset: 0,
    gutterWidth: 50,
    leftPadding: 15,
  },
  socket: {
    isConnected: false,
    endpoint: "",
  },
  errors: [],
  compile: {
    resultLink: "",
    status: CompileStatus.InProgress,
    error: "",
  },
  mediaFiles: {},
};

// ==================== Help funcions ==========================

function makeEmptySelection(): SelectionData {
  return {
    type: SelectionType.N,
    start: { line: 0, offset: 0, totalOffset: 0 },
    end: { line: 0, offset: 0, totalOffset: 0 },
  };
}

function pointCompare(p1: Point, p2: Point): number {
  // Return:
  // 0 if points are equal
  // 1 if first point is greater
  // 2 if second point is greater
  if (p1.line === p2.line) {
    if (p1.offset < p2.offset) {
      return 2;
    } else if (p1.offset === p2.offset) {
      return 0;
    }
    return 1;
  } else if (p1.line < p2.line) {
    return 2;
  }
  return 1;
}

function getLineLengthFromSource(source: Source, lineNumber: number): number {
  // todo
  if (lineNumber < 0) {
    return -1;
  }
  if (lineNumber >= source.totalNewLines) {
    return -1;
  }

  const lineNumebers = [lineNumber, lineNumber + 1];
  const lineOffsets = [0, 0];
  for (let ll = 0; ll < 2; ll++) {
    const lineNumber = lineNumebers[ll];
    let totalOffset: number = 0;
    let passedLines: number = 0;
    let i: number = 0;

    for (i = 0; i < source.piecesCount; i++) {
      const element = source.pieces[i];
      if (
        passedLines <= lineNumber &&
        lineNumber < passedLines + element.newLines + 1
      ) {
        break;
      }
      totalOffset += element.length;
      passedLines += element.newLines;
    }

    const relativeNewLines = lineNumber - passedLines;

    if (relativeNewLines === 0) {
      lineOffsets[ll] = totalOffset;
      continue;
    }

    const tmpPiece = source.pieces[i];
    const inPieceLineOffset =
      source.buffers[tmpPiece.bufferIndex].newLines[
        tmpPiece.firstNewLine + relativeNewLines - 1
      ] -
      tmpPiece.offset +
      1;

    const res = totalOffset + inPieceLineOffset;
    lineOffsets[ll] = res;
  }

  return lineOffsets[1] - lineOffsets[0];
}

export const getOffsetOfPosition = (
  state: EditorState,
  lineNumber: number,
  pos: number
): number => {
  if (lineNumber < 0 || pos < 0) {
    return -1;
  }
  const source: Source | undefined = state.sources[state.currentSourceId];

  if (source === undefined) {
    return -1;
  }
  if (lineNumber > source.totalNewLines) {
    return -1;
  }

  let totalOffset: number = 0;
  let passedLines: number = 0;
  let i: number = 0;

  for (i = 0; i < source.piecesCount; i++) {
    const element = source.pieces[i];
    if (
      passedLines <= lineNumber &&
      lineNumber < passedLines + element.newLines + 1
    ) {
      break;
    }
    totalOffset += element.length;
    passedLines += element.newLines;
  }

  const relativeNewLines = lineNumber - passedLines;

  if (relativeNewLines === 0) {
    return totalOffset + pos;
  }
  const tmpPiece = source.pieces[i];
  const inPieceLineOffset =
    source.buffers[tmpPiece.bufferIndex].newLines[
      tmpPiece.firstNewLine + relativeNewLines - 1
    ] -
    tmpPiece.offset +
    1;

  const res = totalOffset + inPieceLineOffset + pos;
  return res;
};

export const getPositionOfOffset = (
  state: EditorState,
  offset: number
): { line: number; offset: number } => {
  if (offset < 0) {
    return { line: -1, offset: -1 };
  }
  const source: Source = state.sources[state.currentSourceId];

  if (offset > source.totalSize) {
    return { line: -1, offset: -1 };
  }

  let passedLength: number = 0;
  let passedLines: number = 0;
  let i: number = 0,
    j: number = 0;

  for (i = 0; i < source.piecesCount; i++) {
    const piece = source.pieces[i];
    if (passedLength <= offset && offset <= passedLength + piece.length) {
      break;
    }
    passedLength += piece.length;
    passedLines += piece.newLines;
  }

  const piece: Piece = source.pieces[i];
  const buffer: Buffer = source.buffers[piece.bufferIndex];
  const offsetInPiece = offset - passedLength;
  if (piece.newLines > 0) {
    for (j = 0; j < piece.newLines; j++) {
      const newLinePos = buffer.newLines[j + piece.firstNewLine] - piece.offset;
      if (offsetInPiece <= newLinePos) {
        break;
      }
    }

    const prevNewLinePos = buffer.newLines[j + piece.firstNewLine - 1]
      ? buffer.newLines[j + piece.firstNewLine - 1] + 1
      : 0;
    const offsetInLine = offsetInPiece - (prevNewLinePos - piece.offset);
    return { line: passedLines + j, offset: offsetInLine };
  } else {
    let backOffset = 0;
    for (j = i - 1; j > -1; j--) {
      const prevPiece = source.pieces[j];
      if (prevPiece.newLines > 0) {
        break;
      } else {
        backOffset += prevPiece.length;
      }
    }

    if (j >= 0) {
      const prevPiece = source.pieces[j];
      const prevPieceBuffer = source.buffers[prevPiece.bufferIndex];
      const lastNewLineInPrevPiece: number =
        prevPieceBuffer.newLines[
          prevPiece.firstNewLine + prevPiece.newLines - 1
        ];
      const lastNevLineToEndOfPiece =
        prevPiece.offset + prevPiece.length - lastNewLineInPrevPiece - 1;

      return {
        line: passedLines,
        offset: lastNevLineToEndOfPiece + offsetInPiece,
      };
    } else {
      return {
        line: passedLines,
        offset: backOffset + offsetInPiece,
      };
    }
  }
};

// ==================== Main reducer ==========================

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    clearEditorData(state, action: PayloadAction) {
      return initialState;
    },
    setCLientId(state, action: PayloadAction<number>) {
      state.clientId = action.payload;
    },
    setSourceVersion(
      state,
      action: PayloadAction<{ fileId: number; ver: number }>
    ) {
      const source: Source = state.sources[action.payload.fileId];

      if (source !== undefined) {
        source.version = action.payload.ver;
      }
    },
    // =================================== Selectons =================================
    resetSelections(state, action: PayloadAction) {
      // Clear all existing selections and
      // add empty selection at start of a file.
      const newSelection: SelectionData = makeEmptySelection();
      state.selections = [newSelection];
    },
    addSelection(state, action: PayloadAction<SelectionData>) {
      // Add new selection to list of selections
      state.selections.push(action.payload);
    },
    setSelection(state, action: PayloadAction<SelectionData>) {
      // Clear all selections and add selection in specified place
      state.selections = [action.payload];
    },
    extendLastSelection(state, action: PayloadAction<Point>) {
      const selectionsCount = state.selections.length;
      if (selectionsCount < 1) {
        return;
      }

      const point = action.payload;
      const lSel: SelectionData = state.selections[selectionsCount - 1];

      const cmpRes1 = pointCompare(lSel.start, point);
      const cmpRes2 = pointCompare(lSel.end, point);
      if (cmpRes1 === 1) {
        lSel.start = point;
        lSel.type = SelectionType.L;
      } else if (cmpRes2 === 2) {
        lSel.end = point;
        lSel.type = SelectionType.R;
      } else {
        if (lSel.type === SelectionType.L) {
          lSel.start = point;
        } else {
          lSel.end = point;
        }
      }
    },
    updateLastSelection(state, action: PayloadAction<Point>) {
      // Update range of a last added selection
      const selectionsCount = state.selections.length;
      if (selectionsCount < 1) {
        return;
      }
      const point = action.payload;
      const lSel: SelectionData = state.selections[selectionsCount - 1];

      if (lSel.type === SelectionType.L) {
        const cmpRes = pointCompare(lSel.end, point);
        if (cmpRes === 1) {
          // point comes before lSel.end
          lSel.start = point;
        } else {
          lSel.type = SelectionType.R;
          lSel.start = lSel.end;
          lSel.end = point;
        }
      } else if (lSel.type === SelectionType.R) {
        const cmpRes = pointCompare(lSel.start, point);
        if (cmpRes === 2) {
          // point comes after lSel.start
          lSel.end = point;
        } else {
          lSel.type = SelectionType.L;
          lSel.end = lSel.start;
          lSel.start = point;
        }
      } else {
        const cmpRes = pointCompare(lSel.start, point);
        if (cmpRes === 2) {
          lSel.type = SelectionType.R;
          lSel.end = point;
        } else {
          lSel.type = SelectionType.L;
          lSel.start = point;
        }
      }
    },
    addEntireFileSelection(state, action: PayloadAction) {
      const source = state.sources[state.currentSourceId];
      const newSelection: SelectionData = makeEmptySelection();
      newSelection.start.line = 0;
      newSelection.start.offset = 0;
      newSelection.end.line = source.totalNewLines - 1;
      newSelection.end.offset =
        getLineLengthFromSource(source, source.totalNewLines - 1) - 1;
      state.selections = [newSelection];
    },
    collapseSelectionsToLeft(state, action: PayloadAction) {
      const selectionsCount = state.selections.length;
      if (selectionsCount < 1) {
        state.selections = [makeEmptySelection()];
        return;
      }
      if (
        selectionsCount === 1 &&
        state.selections[0].type === SelectionType.N
      ) {
        // Move caret one leter to left
        const firstSelection = state.selections[0];
        // check if it is not start of file
        if (
          !(
            firstSelection.start.line === 0 && firstSelection.start.offset === 0
          )
        ) {
          firstSelection.start.offset -= 1;
          firstSelection.end.offset -= 1;
          if (firstSelection.start.offset < 0) {
            // move caret at the end of previous line
            const source = state.sources[state.currentSourceId];
            if (source === undefined) {
              return;
            }
            const newSelectionLine = firstSelection.start.line - 1;
            const prevLineLength =
              getLineLengthFromSource(source, newSelectionLine) - 1;
            firstSelection.start.line = newSelectionLine;
            firstSelection.end.line = newSelectionLine;
            firstSelection.start.offset = prevLineLength;
            firstSelection.end.offset = prevLineLength;
            return;
          }
        }
      }

      // otherwise colapse all selecions to most left point
      let firstPoint = state.selections[0].start;
      for (const sel of state.selections) {
        if (pointCompare(sel.start, firstPoint) === 2) {
          firstPoint = sel.start;
        }
      }
      const newSelection: SelectionData = {
        type: SelectionType.N,
        start: { ...firstPoint },
        end: { ...firstPoint },
      };
      state.selections = [newSelection];
    },
    collapseSelectionsToRight(state, action: PayloadAction) {
      const selectionsCount = state.selections.length;
      if (selectionsCount < 1) {
        state.selections = [makeEmptySelection()];
        return;
      }

      if (
        selectionsCount === 1 &&
        state.selections[0].type === SelectionType.N
      ) {
        // Move caret one leter to right
        const firstSelection = state.selections[0];
        const source = state.sources[state.currentSourceId];
        if (source === undefined) {
          return;
        }
        const sourceNewLines = source.totalNewLines;
        const lineLength =
          getLineLengthFromSource(source, firstSelection.end.line) - 1;
        // check if it is not end of file
        if (
          !(
            firstSelection.end.line === sourceNewLines - 1 &&
            firstSelection.end.offset === lineLength
          )
        ) {
          firstSelection.start.offset += 1;
          firstSelection.end.offset += 1;
          if (firstSelection.end.offset > lineLength) {
            // move caret at start of previous line
            const newSelectionLine = firstSelection.start.line + 1;
            firstSelection.start.line = newSelectionLine;
            firstSelection.end.line = newSelectionLine;
            firstSelection.start.offset = 0;
            firstSelection.end.offset = 0;
            return;
          }
        }
      }

      // otherwise colapse all selecions to most right point
      let lastPoint = state.selections[0].start;
      for (const sel of state.selections) {
        if (pointCompare(sel.end, lastPoint) === 1) {
          lastPoint = sel.end;
        }
      }
      const newSelection: SelectionData = {
        type: SelectionType.N,
        start: { ...lastPoint },
        end: { ...lastPoint },
      };
      state.selections = [newSelection];
    },
    collapseSelectionsUp(state, action: PayloadAction) {
      const selectionsCount = state.selections.length;
      if (selectionsCount < 1) {
        state.selections = [makeEmptySelection()];
        return;
      }

      // find first selection point
      let firstPoint = state.selections[0].start;
      for (const sel of state.selections) {
        if (pointCompare(sel.start, firstPoint) === 2) {
          firstPoint = sel.start;
        }
      }
      if (firstPoint.line === 0) {
        // start of the first line
        const newSelection: SelectionData = {
          type: SelectionType.N,
          start: { ...firstPoint, offset: 0 },
          end: { ...firstPoint, offset: 0 },
        };
        state.selections = [newSelection];
      } else {
        const source = state.sources[state.currentSourceId];
        if (source === undefined) {
          return;
        }
        const newLine = firstPoint.line - 1;
        const prevLineLength = getLineLengthFromSource(source, newLine) - 1;
        const newOffset =
          prevLineLength < firstPoint.offset
            ? prevLineLength
            : firstPoint.offset;
        const newSelection: SelectionData = {
          type: SelectionType.N,
          start: { line: newLine, offset: newOffset, totalOffset: 0 },
          end: { line: newLine, offset: newOffset, totalOffset: 0 },
        };
        state.selections = [newSelection];
      }
    },
    collapseSelectionsDown(state, action: PayloadAction) {
      const selectionsCount = state.selections.length;
      if (selectionsCount < 1) {
        state.selections = [makeEmptySelection()];
        return;
      }

      // find last selection point
      let lastPoint = state.selections[0].start;
      for (const sel of state.selections) {
        if (pointCompare(sel.end, lastPoint) === 1) {
          lastPoint = sel.end;
        }
      }
      const source = state.sources[state.currentSourceId];
      if (source === undefined) {
        return;
      }

      if (lastPoint.line === source.totalNewLines - 1) {
        // end of the last line
        const lineLength = getLineLengthFromSource(source, lastPoint.line) - 1;
        const newSelection: SelectionData = {
          type: SelectionType.N,
          start: { ...lastPoint, offset: lineLength },
          end: { ...lastPoint, offset: lineLength },
        };
        state.selections = [newSelection];
      } else {
        const newLine = lastPoint.line + 1;
        const nextLineLength = getLineLengthFromSource(source, newLine) - 1;
        const newOffset =
          nextLineLength < lastPoint.offset ? nextLineLength : lastPoint.offset;
        const newSelection: SelectionData = {
          type: SelectionType.N,
          start: { line: newLine, offset: newOffset, totalOffset: 0 },
          end: { line: newLine, offset: newOffset, totalOffset: 0 },
        };
        state.selections = [newSelection];
      }
    },
    // =================================== Cursors =================================
    addCursor(state, action: PayloadAction<Cursor>) {
      if (
        !Object.keys(state.sources).includes(action.payload.sourceId.toString())
      ) {
        // source do not exists in memory
        return;
      }
      const sourceLen: number =
        state.sources[action.payload.sourceId].totalSize;
      if (action.payload.offset > sourceLen) {
        // wrong cursor position
        return;
      }

      let replaced = false;

      //check if cursor with given clientId already exist and replace it
      for (let i = 0; i < state.cursors.length; i++) {
        const cursor = state.cursors[i];
        if (cursor.clientId === action.payload.clientId) {
          state.cursors[i] = action.payload;
          replaced = true;
          break;
        }
      }

      // if cursor wasnt replaced add new cursor
      if (!replaced) {
        state.cursors.push(action.payload);
      }
    },

    removeCursor(state, action: PayloadAction<number>) {
      // find cursor in list
      for (let i = 0; i < state.cursors.length; i++) {
        const cursor = state.cursors[i];

        if (cursor.clientId === action.payload) {
          // remove cursor from list
          state.cursors.splice(i, 1);
          break;
        }
      }
    },

    removeAllCursors(state, action: PayloadAction) {
      state.cursors = [];
    },

    moveCursor(state, action: PayloadAction<number>) {
      // find cursor in list
      for (let i = 0; i < state.cursors.length; i++) {
        const cursor = state.cursors[i];

        if (cursor.clientId === action.payload) {
          // change cursor position
          cursor.offset = action.payload;
          break;
        }
      }
    },

    // =================================== Sources =================================
    addSource(state, action: PayloadAction<Source>) {
      state.sources[action.payload.id] = action.payload;
    },

    setSource(state, action: PayloadAction<number>) {
      if (state.sources[action.payload] !== undefined) {
        state.currentSourceId = action.payload;
      } else {
        const error: Error = {
          code: ErrorCodes.WRONG_SOURCE_ID,
          msg: "Wrong source id",
        };
        state.errors.push(error);
      }
    },

    // =================================== Loading =================================
    setLoadingStatus(state, action: PayloadAction<boolean>) {
      state.loading.editor = action.payload;
    },

    moveDefaultCursorAtEndOfLine(state, action) {},
    moveDefaultCursorAtEndOfSource(state, action) {},
    _insert(state, action: PayloadAction<InsertPayload>) {
      const insertString: string = action.payload.str;
      const insertOffset: number = action.payload.offset;
      const clientId: number = action.payload.clientId;
      const insertStringLength: number = insertString.length;

      // return if empty string
      if (insertString === "") {
        return;
      }

      const selectedSourceId: number = action.payload.sourceId;
      const selectedSource: Source = state.sources[selectedSourceId];

      // return if source didnt exist
      if (selectedSource === undefined) {
        return;
      }

      // Check if insert offset is valid
      if (insertOffset < 0 || insertOffset > selectedSource.totalSize + 1) {
        const error: Error = {
          code: 1,
          msg: "Paste offset out of bounds",
        };
        state.errors.push(error);
        return;
      }
      // Cache selections total offsets
      const selectionsTotalOffsets = [];
      for (const selection of state.selections) {
        selectionsTotalOffsets.push([
          getOffsetOfPosition(
            state,
            selection.start.line,
            selection.start.offset
          ),
          getOffsetOfPosition(state, selection.end.line, selection.end.offset),
        ]);
      }

      // set last edit clientId
      selectedSource.lastEditClientId = clientId;

      // add new buffer if current add buffer is full
      let createdNewBuffer = false;
      if (
        selectedSource.buffers[selectedSource.buffersCount - 1].content.length >
        MAX_BUFFER_SIZE
      ) {
        const addBuffer: Buffer = {
          content: "",
          size: 0,
          newLines: [],
        };
        selectedSource.buffers.push(addBuffer);
        selectedSource.buffersCount += 1;
        createdNewBuffer = true;
      }
      // add inserted string to buffer
      const buffersCount: number = selectedSource.buffersCount;
      const addBuffer: Buffer = selectedSource.buffers[buffersCount - 1];
      const addBufferInsertOffset: number = addBuffer.size;
      const addbufferNewLinesCount: number = addBuffer.newLines.length;

      addBuffer.content += insertString;
      addBuffer.size += insertStringLength;

      // check if inserted string contains new lines
      let hasNewLines: boolean = false;
      let newLinesCount: number = 0;
      for (let i: number = 0; i < insertStringLength; i++) {
        const element = insertString[i];
        if (element === "\n" || element === "\r") {
          hasNewLines = true;
          addBuffer.newLines.push(addBufferInsertOffset + i);
          newLinesCount++;
        }
      }

      // Check if we can extend last edited piece or we have to add new one
      if (
        !createdNewBuffer && // we can use continous memory
        clientId === selectedSource.lastEditClientId && // changes is made by the same user
        insertOffset === selectedSource.lastEditOffset + 1 && // insert is continous
        insertStringLength === 1 && // insert single char
        selectedSource.pieces[selectedSource.lastEditPieceNumber] !== undefined // node still exists
      ) {
        // extend last edited piece

        const lastEditedPiece: Piece =
          selectedSource.pieces[selectedSource.lastEditPieceNumber];

        // update lengths / new lines count
        lastEditedPiece.length += insertStringLength;
        lastEditedPiece.newLines += newLinesCount;
        if (hasNewLines && lastEditedPiece.firstNewLine < 0) {
          lastEditedPiece.firstNewLine = addbufferNewLinesCount;
        }
      } else {
        // create new piece
        const newPiece: Piece = {
          bufferIndex: buffersCount - 1,
          offset: addBufferInsertOffset,
          length: insertStringLength,
          firstNewLine: hasNewLines ? addbufferNewLinesCount : -1,
          newLines: newLinesCount,
        };

        let i = -1;
        let cumulativeLength = 0;
        while (cumulativeLength < insertOffset - 1) {
          cumulativeLength += selectedSource.pieces[++i].length;
        }

        if (insertOffset >= cumulativeLength) {
          // insert piece after i piece
          selectedSource.pieces.splice(i + 1, 0, newPiece);
          selectedSource.piecesCount++;
          selectedSource.lastEditPieceNumber = i + 1;
        } else if (
          insertOffset ===
          cumulativeLength - selectedSource.pieces[i].length
        ) {
          // insert before i piece
          selectedSource.pieces.splice(i, 0, newPiece);
          selectedSource.piecesCount++;
          selectedSource.lastEditPieceNumber = i;
        } else {
          // split i piece
          const splittedPiece = selectedSource.pieces[i];
          cumulativeLength -= splittedPiece.length;

          const leftPiece: Piece = {
            bufferIndex: splittedPiece.bufferIndex,
            offset: splittedPiece.offset,
            length: insertOffset - cumulativeLength,
            firstNewLine: splittedPiece.firstNewLine,
            newLines: 0,
          };
          const rightPiece: Piece = {
            bufferIndex: splittedPiece.bufferIndex,
            offset: splittedPiece.offset + leftPiece.length,
            length: splittedPiece.length - leftPiece.length,
            firstNewLine: splittedPiece.firstNewLine,
            newLines: 0,
          };

          // calculate new lines
          if (splittedPiece.newLines !== 0) {
            const tmpBuffer: Buffer =
              selectedSource.buffers[splittedPiece.bufferIndex];
            let j = 0; // index of new line in buffer array

            while (
              j < splittedPiece.newLines &&
              tmpBuffer.newLines[j + splittedPiece.firstNewLine] <
                splittedPiece.offset + leftPiece.length
            ) {
              j++;
            }

            leftPiece.newLines = j;
            if (leftPiece.newLines === 0) {
              leftPiece.firstNewLine = -1;
            }

            rightPiece.newLines = splittedPiece.newLines - j;
            if (rightPiece.newLines === 0) {
              rightPiece.firstNewLine = -1;
            } else {
              rightPiece.firstNewLine = splittedPiece.firstNewLine + j;
            }
          }

          // insert pieces into table
          selectedSource.pieces.splice(
            i,
            1,
            ...[leftPiece, newPiece, rightPiece]
          );
          selectedSource.piecesCount += 2;
          selectedSource.lastEditPieceNumber = i + 1;
        }
      }
      selectedSource.totalSize += insertStringLength;
      selectedSource.totalNewLines += newLinesCount;
      selectedSource.lastEditOffset = insertOffset;

      // updateSelectionsPosition(
      //   state,
      //   insertOffset,
      //   insertStringLength,
      //   newLinesCount,
      //   0
      // );
      for (let i = 0; i < state.selections.length; i++) {
        const selection = state.selections[i];
        const selectionOffsets = selectionsTotalOffsets[i];
        if (selectionOffsets[0] >= insertOffset) {
          const newSelectionPos = getPositionOfOffset(
            state,
            selectionOffsets[0] + insertStringLength
          );
          selection.start = { ...newSelectionPos, totalOffset: 0 };
        }
        if (selectionOffsets[1] >= insertOffset) {
          const newSelectionPos = getPositionOfOffset(
            state,
            selectionOffsets[1] + insertStringLength
          );
          selection.end = { ...newSelectionPos, totalOffset: 0 };
        }
      }
    },
    _remove(state, action: PayloadAction<RemovePayload>) {
      const deleteOffset: number = action.payload.offset;
      const deleteLength: number = action.payload.length;
      const clientId: number = action.payload.clientId;

      // do not delete anything
      if (deleteLength === 0) {
        return;
      }
      const selectedSourceId: number = action.payload.sourceId;
      const selectedSource: Source = state.sources[selectedSourceId];
      // return if source didnt exist
      if (selectedSource === undefined) {
        return;
      }

      // Check if insert offset is valid
      if (
        deleteOffset < 0 ||
        deleteOffset + deleteLength > selectedSource.totalSize
      ) {
        const error: Error = {
          code: 2,
          msg: "Delete offset out of bounds",
        };
        state.errors.push(error);
        return;
      }

      // set last edit clientId
      selectedSource.lastEditClientId = clientId;

      // 1. Search for piece to remove from
      // 2. if we remove text at the end (or start) of piece just change it length / new lines count
      // 3. if we remove text inside of piece, split it in half an delete at the end of new piece

      // Find piece containing offset
      let i = -1;
      let cumulativeLength = 0;
      while (cumulativeLength <= deleteOffset) {
        cumulativeLength += selectedSource.pieces[++i].length;
      }
      if (i < 0) {
        i = 0;
      } else {
        cumulativeLength -= selectedSource.pieces[i].length;
      }

      // i - first piece to delete from
      selectedSource.lastEditPieceNumber = i;
      let deletedNewLines: number = 0;
      let remainingToDelete: number = deleteLength;
      while (remainingToDelete > 0) {
        const tmpPiece: Piece = selectedSource.pieces[i];
        let startDeleteInPiece: boolean = false;
        let endDeleteInPiece: boolean = false;

        startDeleteInPiece = deleteOffset >= cumulativeLength;

        endDeleteInPiece =
          deleteOffset + remainingToDelete - 1 <
          cumulativeLength + tmpPiece.length;

        let piecesToReplace: Piece[] = [];
        if (startDeleteInPiece) {
          const newPiece: Piece = {
            bufferIndex: tmpPiece.bufferIndex,
            offset: tmpPiece.offset,
            length: deleteOffset - cumulativeLength,
            firstNewLine: tmpPiece.firstNewLine,
            newLines: 0,
          };
          const tmpBuffer: Buffer =
            selectedSource.buffers[tmpPiece.bufferIndex];

          // calculate new lines to delete
          let j = 0;
          while (
            j < tmpPiece.newLines &&
            tmpBuffer.newLines[j + tmpPiece.firstNewLine] <
              tmpPiece.offset + newPiece.length
          ) {
            j++;
          }

          newPiece.newLines = j;

          deletedNewLines += tmpPiece.newLines - j;

          piecesToReplace.push(newPiece);
        }

        if (endDeleteInPiece) {
          const newPiece: Piece = {
            bufferIndex: tmpPiece.bufferIndex,
            offset:
              deleteOffset -
              cumulativeLength +
              remainingToDelete +
              tmpPiece.offset,
            length:
              tmpPiece.length -
              (deleteOffset - cumulativeLength + remainingToDelete),
            firstNewLine: -1,
            newLines: 0,
          };
          const tmpBuffer: Buffer =
            selectedSource.buffers[tmpPiece.bufferIndex];

          // calculate new lines to delete
          let j = 0;
          while (
            j < tmpPiece.newLines &&
            tmpBuffer.newLines[j + tmpPiece.firstNewLine] <
              tmpPiece.offset + tmpPiece.length - newPiece.length
          ) {
            j++;
          }

          newPiece.newLines = tmpPiece.newLines - j;
          newPiece.firstNewLine =
            newPiece.newLines > 0 ? j + tmpPiece.firstNewLine : -1;

          deletedNewLines -= tmpPiece.newLines - j;

          piecesToReplace.push(newPiece);
        }

        if (!startDeleteInPiece && !endDeleteInPiece) {
          remainingToDelete -= tmpPiece.length;
        }
        if (startDeleteInPiece) {
          remainingToDelete -= tmpPiece.length - piecesToReplace[0].length;
        }

        if (startDeleteInPiece || endDeleteInPiece) {
          // replace piece
          selectedSource.pieces.splice(i, 1, ...piecesToReplace);
          selectedSource.piecesCount += piecesToReplace.length - 1;
          i += piecesToReplace.length;
        } else {
          // delete peice

          deletedNewLines += selectedSource.pieces[i].newLines;
          selectedSource.piecesCount -= 1;
          selectedSource.pieces.splice(i, 1);
        }

        if (endDeleteInPiece) break;
      }

      selectedSource.totalSize -= deleteLength;
      selectedSource.totalNewLines -= deletedNewLines; //todo;
      selectedSource.lastEditOffset = deleteOffset;

      for (let i = 0; i < state.selections.length; i++) {
        const element = state.selections[i];
        element.start.offset--;
        element.end.offset--;
      }
    },
    replace(state, action: PayloadAction) {},
    replaceAll(state, action: PayloadAction) {},
    swapLines(state, action) {},
    undoLastChange(state, action) {},
    redoNextChange(state, action) {},
    applyChanges(state, action) {},
    compile(state, action: PayloadAction<{ fileId: number }>) {
      state.compile.status = CompileStatus.InProgress;
    },
    setCompileResult(state, action: PayloadAction<CompileResult>) {
      if (action.payload.error !== "") {
        state.compile.status = CompileStatus.Error;
      } else {
        state.compile.status = CompileStatus.Ready;
      }
      state.compile.resultLink = action.payload.link;
      state.compile.error = action.payload.error;
    },

    // =================================== Styles =================================
    setMaxVisibleCharacters(state, action: PayloadAction<number>) {
      state.style.maxLineCharacters = action.payload;
    },
    setEditorWidth(state, action: PayloadAction<number>) {
      if (action.payload > 0) {
        state.style.width = action.payload;
      }
    },
    setEditorHeight(state, action: PayloadAction<number>) {
      if (action.payload > 0) {
        state.style.height = action.payload;
        state.style.maxVisibleLinesCount =
          state.style.height / state.style.lineHeight;
      }
    },
    setEditorSize: {
      reducer(state, action: PayloadAction<{ width: number; height: number }>) {
        if (action.payload.width > 0) {
          state.style.width = action.payload.width;
        }
        if (action.payload.height > 0) {
          state.style.height = action.payload.height;
          state.style.maxVisibleLinesCount =
            Math.ceil(state.style.height / state.style.lineHeight) + 1;
        }
      },
      prepare(width: number, height: number) {
        return {
          payload: {
            width: width,
            height: height,
          },
        };
      },
    },
    setScrollOffset(state, action: PayloadAction<number>) {
      if (action.payload > -1) {
        state.style.scrollOffset = action.payload;
        state.style.firstVisibleLine = Math.floor(
          state.style.scrollOffset / state.style.lineHeight
        );
      }
    },
    setFontFamily(state, action: PayloadAction<string>) {
      state.style.fontFamily = action.payload;

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }
      context.font = "16px Source Code Pro, monospace"; // todo
      const metrics = context.measureText("qwertp");
      state.style.letterWidth = metrics.width / 6;
    },
  },
  extraReducers: (builder) =>
    builder
      // ================ Create Source ======================
      .addCase(createSource.pending, (state, action) => {
        state.loading.createSource = true;
      })
      .addCase(createSource.fulfilled, (state, action) => {
        const newSource = action.payload;
        const element: any = newSource;

        const firstBuffer: Buffer = {
          content: element.plainText,
          size: element.plainText.length,
          newLines: element.lineOffsets,
        };
        const addBuffer: Buffer = {
          content: "",
          size: 0,
          newLines: [],
        };

        const firstPiece: Piece = {
          bufferIndex: 0,
          offset: 0,
          length: element.plainText.length,
          firstNewLine: 0,
          newLines: element.linesCount,
        };

        const source: Source = {
          id: element.id,
          name: element.name,
          pieces: [firstPiece],
          piecesCount: 1,
          buffers: [firstBuffer, addBuffer],
          versions: [],
          markers: [],
          totalSize: element.plainText.length,
          totalNewLines: element.linesCount,
          version: element.ver,
          buffersCount: 2,
          lastEditOffset: 0,
          lastEditClientId: -1,
          lastEditPieceNumber: -1,
        };
        state.sources[newSource.id] = source;

        state.currentSourceId = newSource.id;
        state.selections = [makeEmptySelection()];
        state.loading.createSource = false;
      })
      .addCase(createSource.rejected, (state, action) => {
        console.error(action.payload);
        state.loading.createSource = false;
      })
      .addCase(uploadFile.pending, (state, action) => {
        state.loading.uploadFile = true;
      })
      .addCase(
        uploadFile.fulfilled,
        (state, action: PayloadAction<MediaFile>) => {
          state.loading.uploadFile = false;
          state.mediaFiles[action.payload.id] = action.payload;
        }
      )
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading.uploadFile = false;
      })
      .addCase(fetchProject.pending, (state, action: PayloadAction) => {
        state.loading.editor = true;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        const project: FullProjectEntity = action.payload;
        state.projectId = project.id;
        state.projectTitle = project.title;
        state.compile.resultLink = project.last_compile_link;
        state.compile.status = CompileStatus.Ready;
        const sources = project.files;
        const sourcesCount = sources.length;
        const sourcesObj: Sources = {};

        for (let index: number = 0; index < sourcesCount; index++) {
          const element = sources[index];

          const firstBuffer: Buffer = {
            content: element.plainText,
            size: element.plainText.length,
            newLines: element.lineOffsets,
          };
          const addBuffer: Buffer = {
            content: "",
            size: 0,
            newLines: [],
          };

          const firstPiece: Piece = {
            bufferIndex: 0,
            offset: 0,
            length: element.plainText.length,
            firstNewLine: 0,
            newLines: element.linesCount,
          };

          const source: Source = {
            id: element.id,
            name: element.name,
            pieces: [firstPiece],
            piecesCount: 1,
            buffers: [firstBuffer, addBuffer],
            versions: [],
            markers: [],
            totalSize: element.plainText.length,
            totalNewLines: element.linesCount,
            version: element.ver,
            buffersCount: 2,
            lastEditOffset: 0,
            lastEditClientId: -1,
            lastEditPieceNumber: -1,
          };
          sourcesObj[element.id] = source;
        }
        state.sources = sourcesObj;
        if (sourcesCount > 0) {
          state.currentSourceId = sources[0].id;
        }
        if (project.last_edited_file) {
          state.currentSourceId = project.last_edited_file;
        }

        const mediaFiles: MediaFiles = {};
        for (const file of project.mediaFiles) {
          const mediaFile: MediaFile = file;
          mediaFiles[mediaFile.id] = mediaFile;
        }
        state.mediaFiles = mediaFiles;
        state.loading.editor = false;
      })
      .addCase(
        updateProject.fulfilled,
        (state, action: PayloadAction<ProjectEntity>) => {
          if (action.payload.id === state.projectId) {
            state.projectTitle = action.payload.title;
          }
        }
      ),
});

export const {
  clearEditorData,
  setCLientId,
  setSourceVersion,
  // Selections
  resetSelections,
  addSelection,
  setSelection,
  extendLastSelection,
  updateLastSelection,
  addEntireFileSelection,
  collapseSelectionsToLeft,
  collapseSelectionsToRight,
  collapseSelectionsUp,
  collapseSelectionsDown,

  setSource,
  setLoadingStatus,
  moveDefaultCursorAtEndOfLine,
  moveDefaultCursorAtEndOfSource,
  _insert,
  _remove,

  replace,
  swapLines,
  undoLastChange,
  redoNextChange,
  applyChanges,
  // Style
  setMaxVisibleCharacters,
  setEditorWidth,
  setEditorHeight,
  setEditorSize,
  setScrollOffset,
  setFontFamily,
  // Compile
  compile,
  setCompileResult,
} = editorSlice.actions;

export default editorSlice.reducer;

// =========================== Selectors ================================

export const selectText = (state: RootState): string => {
  let text: string = "";
  return text;
};

// Select linesCount starting from state.newEditor.style.firstVisibleLine / to change
export const selectLines = (
  state: RootState,
  linesCount: number = 1
): string[] => {
  if (linesCount < 1) {
    return [];
  }

  // Check if selected source exists
  const selectedSourceId = state.newEditor.currentSourceId;
  const source = state.newEditor.sources[selectedSourceId];
  if (source === undefined) {
    return [];
  }

  // Check if there is any piece
  let tmpPiece: Piece | undefined = source.pieces[0];
  if (tmpPiece === undefined) {
    return [];
  }

  const firstVisibleLineNumber = state.newEditor.style.firstVisibleLine; // start at first visible line in window
  let lines: string[] = []; // list containing selected lines
  let skippedLines: number = 0;
  let readedLines: number = 0;
  let isReading: boolean = false;
  let i: number = 0;
  let readedText: string = ""; // contains all lines

  // find first piece
  do {
    if (i === source.pieces.length) {
      return [];
    }
    skippedLines += source.pieces[i].newLines;
    i++;
  } while (skippedLines < firstVisibleLineNumber);
  i--;
  skippedLines -= source.pieces[i].newLines;

  const relativeNewLines = firstVisibleLineNumber - skippedLines;

  tmpPiece = source.pieces[i];
  while (readedLines < linesCount && tmpPiece !== undefined) {
    const bufferNewLines: number[] =
      source.buffers[tmpPiece.bufferIndex].newLines;

    let startIndex: number = 0;
    let endIndex: number = 0;

    if (!isReading && tmpPiece.firstNewLine + relativeNewLines - 1 >= 0) {
      startIndex =
        bufferNewLines[tmpPiece.firstNewLine + relativeNewLines - 1] + 1;
    } else {
      startIndex = tmpPiece.offset;
    }

    if (tmpPiece.newLines > relativeNewLines + linesCount - readedLines) {
      endIndex =
        bufferNewLines[
          tmpPiece.firstNewLine +
            relativeNewLines +
            linesCount -
            readedLines -
            1
        ];
      readedLines = linesCount;
    } else {
      if (isReading) {
        readedLines += tmpPiece.newLines;
      } else {
        isReading = true;
        readedLines += tmpPiece.newLines - relativeNewLines;
      }
      endIndex = tmpPiece.offset + tmpPiece.length;
    }

    readedText += source.buffers[tmpPiece.bufferIndex].content.slice(
      startIndex,
      endIndex
    );

    tmpPiece = source.pieces[++i];
  }

  lines = readedText.split(/\r?\n|\r|\n/g);

  if (lines.length === 0) {
    return [""];
  }

  return lines;
};

export const selectLineContent = (
  state: RootState,
  lineIndex: number
): string => {
  return "";
};

export const selectSourceName = (
  state: RootState,
  sourceId: number
): string => {
  const source: Source | undefined = state.newEditor.sources[sourceId];
  if (source !== undefined) {
    return source.name;
  }
  return "";
};

export const selectIsSourceSelected = (
  state: RootState,
  sourceId: number
): boolean => {
  const source: Source | undefined = state.newEditor.sources[sourceId];
  if (source !== undefined) {
    return source.id === state.newEditor.currentSourceId;
  }
  return false;
};

export const selectSourceMeta = (
  state: RootState,
  sourceId: number
): SourceMeta | undefined => {
  const source: Source | undefined = state.newEditor.sources[sourceId];
  if (source !== undefined) {
    const metaData: SourceMeta = {
      id: source.id,
      name: source.name,
    };

    return metaData;
  }
  return undefined;
};

export const selectAllSourceIds = (state: RootState): number[] => {
  const keys = Object.keys(state.newEditor.sources);

  let allIds = [];
  for (let i = 0; i < keys.length; i++) {
    const sourceId = keys[i];
    allIds.push(parseInt(sourceId));
  }

  return allIds;
};

export const selectCurrentSourceId = (state: RootState): number => {
  return state.newEditor.currentSourceId;
};

export const selectCurrentProjectId = (
  state: RootState
): string | undefined => {
  return state.newEditor.projectId;
};

export const selectEditorStyle = (state: RootState): EditorStyle => {
  return state.newEditor.style;
};

export const selectEditorWidth = (state: RootState): number => {
  return state.newEditor.style.width;
};

export const selectEditorMAxVisibleLines = (state: RootState): number => {
  return state.newEditor.style.maxVisibleLinesCount;
};

export const selectFirstVisibleLineIndex = (state: RootState): number => {
  return state.newEditor.style.firstVisibleLine;
};

export const selectTotalLinesCount = (state: RootState): number => {
  const source: Source | undefined =
    state.newEditor.sources[state.newEditor.currentSourceId];
  if (source === undefined) {
    return 0;
  }

  return source.totalNewLines;
};

export const selectCurrentSourceSize = (state: RootState): number => {
  const source: Source | undefined =
    state.newEditor.sources[state.newEditor.currentSourceId];
  if (source === undefined) {
    return 0;
  }

  return source.totalSize;
};

export const selectSelections = (state: RootState): SelectionData[] => {
  return state.newEditor.selections;
};

export const selectGutterProps = (
  state: RootState
): [number, number, number] => {
  return [
    state.newEditor.style.gutterWidth,
    state.newEditor.style.firstVisibleLine,
    state.newEditor.style.maxVisibleLinesCount,
  ];
};

export const selectGutterWidth = (state: RootState): number => {
  return state.newEditor.style.gutterWidth;
};

export const selectPositionOffset = (
  state: RootState,
  lineNumber: number,
  pos: number
): number => {
  if (lineNumber < 0 || pos < 0) {
    return -1;
  }
  const source: Source | undefined =
    state.newEditor.sources[state.newEditor.currentSourceId];

  if (source === undefined) {
    return -1;
  }
  if (lineNumber > source.totalNewLines) {
    return -1;
  }

  let totalOffset: number = 0;
  let passedLines: number = 0;
  let i: number = 0;

  for (i = 0; i < source.piecesCount; i++) {
    const element = source.pieces[i];
    if (
      passedLines <= lineNumber &&
      lineNumber < passedLines + element.newLines + 1
    ) {
      break;
    }
    totalOffset += element.length;
    passedLines += element.newLines;
  }

  const relativeNewLines = lineNumber - passedLines;

  if (relativeNewLines === 0) {
    return totalOffset + pos;
  }
  const tmpPiece = source.pieces[i];
  const inPieceLineOffset =
    source.buffers[tmpPiece.bufferIndex].newLines[
      tmpPiece.firstNewLine + relativeNewLines - 1
    ] -
    tmpPiece.offset +
    1;

  const res = totalOffset + inPieceLineOffset + pos;
  return res;
};

export const selectPositionOfOffset = (
  state: RootState,
  offset: number
): { line: number; offset: number } => {
  return getPositionOfOffset(state.newEditor, offset);
};

export const selectLineLength = (
  state: RootState,
  lineNumber: number
): number => {
  const source: Source | undefined =
    state.newEditor.sources[state.newEditor.currentSourceId];
  if (source === undefined) {
    return -1;
  }
  return getLineLengthFromSource(source, lineNumber);
};

export const selectCompilationStatus = (state: RootState): CompileStatus => {
  return state.newEditor.compile.status;
};

export const selectCompilationResultLink = (state: RootState): string => {
  return state.newEditor.compile.resultLink;
};

export const selectCompilationResultError = (state: RootState): string => {
  return state.newEditor.compile.error;
};

export const selectCurrentProjectName = (state: RootState): string => {
  return state.newEditor.projectTitle;
};

export const selectMediaFiles = (state: RootState): MediaFile[] => {
  return Object.values(state.newEditor.mediaFiles);
};

export const selectMediaFileAllIds = (state: RootState): string[] => {
  return Object.keys(state.newEditor.mediaFiles);
};

export const selectMediaFileById = (
  state: RootState,
  id: number
): MediaFile | undefined => {
  return state.newEditor.mediaFiles[id];
};

export const selectEditorLoading = (state: RootState): boolean => {
  return state.newEditor.loading.editor;
};

// ========================= Actions ==============================
export const insert = createAction<InsertPayload>("insert");
export const remove = createAction<RemovePayload>("remove");

// ==================== Async Thunks ==============================
export const createSource = createAsyncThunk<Source, CreateSourceData>(
  "editor/createFile",
  async (data, thunkApi) => {
    const { projectId, filename } = data;

    const csrftoken = getCookie("csrftoken");
    const config = {
      method: "POST",
      headers: { "X-CSRFToken": csrftoken, "Content-Type": "application/json" },
    };
    const requestData = {
      filename: filename,
    };

    try {
      const response = await editorEndpoint.post(
        `projects/${projectId}/create_file/`,
        requestData,
        config
      );
      return response.data;
    } catch (err: any) {
      return thunkApi.rejectWithValue(err.response.data);
    }
  }
);

type UploadSourceData = {
  projectId: string;
  file: File;
};

export const uploadFile = createAsyncThunk<MediaFile, UploadSourceData>(
  "editor/uploadFile",
  async (data, thunkApi) => {
    const { projectId, file } = data;
    const csrftoken = getCookie("csrftoken");
    const config: AxiosRequestConfig = {
      method: "POST",
      headers: {
        "X-CSRFToken": csrftoken,
        "Content-Type": "multipart/form-data",
        "Content-Disposition": `form-data; name="file"; filename="${file.name}"`,
      },
    };
    const formData = new FormData();
    formData.append("filename", file.name);
    formData.append("file", file);

    try {
      const response = await editorEndpoint.post(
        `projects/${projectId}/upload_file/`,
        formData,
        config
      );
      return response.data;
    } catch (err: any) {
      return thunkApi.rejectWithValue(err.response.data);
    }
  }
);
