import { RootState, rootReducer } from "../../store";
import reducer, {
  EditorState,
  setCLientId,
  setSourceVersion,
  Source,
  Buffer,
  Piece,
  _insert,
  InsertPayload,
  selectPositionOffset,
  selectLines,
  CompileStatus,
  RemovePayload,
  _remove,
  SelectionType,
} from "./newEditorSlice";

const initialState: EditorState = {
  projectId: undefined,
  clientId: -1,
  projectTitle: "",
  loading: {
    editor: false,
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

function copyObject(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

function createDummySource(id: number, name: string, text: string): Source {
  const buffer: Buffer = {
    content: text,
    newLines: [],
    size: text.length,
  };
  const addBuffer: Buffer = {
    content: "",
    newLines: [],
    size: 0,
  };
  const firstPiece: Piece = {
    bufferIndex: 0,
    offset: 0,
    length: text.length,
    firstNewLine: -1,
    newLines: 0,
  };
  const source: Source = {
    id: id,
    name: name,
    totalNewLines: 0,
    totalSize: text.length,
    pieces: [firstPiece],
    piecesCount: 1,
    buffers: [buffer, addBuffer],
    buffersCount: 2,
    version: 1,
    versions: [],
    markers: [],
    lastEditClientId: -1,
    lastEditOffset: -1,
    lastEditPieceNumber: -1,
  };

  return source;
}

test("should return the initial state", () => {
  expect(reducer(undefined, { type: undefined })).toEqual(initialState);
});

test("clientId should be equal to particular value without change ", () => {
  const cientId1 = 12;
  const cientId2 = 13454532;
  const cientId3 = 34523;

  const previousState: EditorState = JSON.parse(JSON.stringify(initialState));

  const expectedState1: EditorState = JSON.parse(JSON.stringify(previousState));
  expectedState1.clientId = cientId1;

  const expectedState2: EditorState = JSON.parse(
    JSON.stringify(expectedState1)
  );
  expectedState2.clientId = cientId2;

  const expectedState3: EditorState = JSON.parse(
    JSON.stringify(expectedState2)
  );
  expectedState3.clientId = cientId3;

  expect(reducer(previousState, setCLientId(cientId1))).toEqual(expectedState1);
  expect(reducer(expectedState1, setCLientId(cientId2))).toEqual(
    expectedState2
  );
  expect(reducer(expectedState2, setCLientId(cientId3))).toEqual(
    expectedState3
  );
});

test("setSourceVersion, no sources available", () => {
  const previousState: EditorState = JSON.parse(JSON.stringify(initialState));
  const expectedState: EditorState = JSON.parse(JSON.stringify(previousState));
  const actionPayload = {
    fileId: 12,
    ver: 17,
  };

  expect(reducer(previousState, setSourceVersion(actionPayload))).toEqual(
    expectedState
  );
});

test("setSourceVersion", () => {
  const sourceId = 3414132;
  const source1: Source = createDummySource(sourceId, "", "");
  const actionPayload1 = {
    fileId: sourceId,
    ver: 17,
  };
  const actionPayload2 = {
    fileId: sourceId,
    ver: 191,
  };
  const actionPayload3 = {
    fileId: 114321,
    ver: 191,
  };
  const previousState: EditorState = JSON.parse(JSON.stringify(initialState));
  previousState.sources[sourceId] = source1;
  const expectedState1: EditorState = JSON.parse(JSON.stringify(previousState));
  expectedState1.sources[sourceId].version = actionPayload1.ver;
  const expectedState2: EditorState = JSON.parse(JSON.stringify(previousState));
  expectedState2.sources[sourceId].version = actionPayload2.ver;

  expect(reducer(previousState, setSourceVersion(actionPayload1))).toEqual(
    expectedState1
  );
  expect(reducer(expectedState1, setSourceVersion(actionPayload2))).toEqual(
    expectedState2
  );
  expect(reducer(expectedState2, setSourceVersion(actionPayload3))).toEqual(
    expectedState2
  );
});

test("_insert 1", () => {
  const sourceId = 3414132;
  const clientId = 542354;
  const source: Source = createDummySource(
    sourceId,
    "name",
    "Mauris rutrum dolor ut diam."
  );
  const actionPayload1: InsertPayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 12,
    str: "k",
  };

  const expectedAddBuffer: Buffer = {
    content: "k",
    size: 1,
    newLines: [],
  };
  const expected1Piece: Piece = {
    bufferIndex: 0,
    offset: 0,
    length: actionPayload1.offset,
    firstNewLine: -1,
    newLines: 0,
  };
  const expected2Piece: Piece = {
    bufferIndex: 1,
    offset: 0,
    length: 1,
    firstNewLine: -1,
    newLines: 0,
  };
  const expected3Piece: Piece = {
    bufferIndex: 0,
    offset: actionPayload1.offset,
    length: 28 - actionPayload1.offset,
    firstNewLine: -1,
    newLines: 0,
  };

  const previousState: EditorState = JSON.parse(JSON.stringify(initialState));
  previousState.sources[sourceId] = source;
  const newState = reducer(previousState, _insert(actionPayload1));
  const newSource = newState.sources[sourceId];

  expect(newSource.totalNewLines).toEqual(0);
  expect(newSource.totalSize).toEqual(29);
  expect(newSource.lastEditClientId).toEqual(clientId);
  expect(newSource.lastEditOffset).toEqual(actionPayload1.offset);
  expect(newSource.lastEditPieceNumber).toEqual(1);
  expect(newSource.piecesCount).toEqual(3);
  expect(newSource.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource.buffers[1]).toEqual(expectedAddBuffer);
  expect(newSource.pieces[0]).toEqual(expected1Piece);
  expect(newSource.pieces[1]).toEqual(expected2Piece);
  expect(newSource.pieces[2]).toEqual(expected3Piece);
});

test("_insert 2", () => {
  const sourceId = 3414132;
  const clientId = 542354;
  const source: Source = createDummySource(
    sourceId,
    "name",
    "Mauris rutrum dolor ut diam."
  );
  const actionPayload1: InsertPayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 15,
    str: "kkkk",
  };

  const expectedAddBuffer: Buffer = {
    content: actionPayload1.str,
    size: actionPayload1.str.length,
    newLines: [],
  };
  const expected1Piece: Piece = {
    bufferIndex: 0,
    offset: 0,
    length: actionPayload1.offset,
    firstNewLine: -1,
    newLines: 0,
  };
  const expected2Piece: Piece = {
    bufferIndex: 1,
    offset: 0,
    length: actionPayload1.str.length,
    firstNewLine: -1,
    newLines: 0,
  };
  const expected3Piece: Piece = {
    bufferIndex: 0,
    offset: actionPayload1.offset,
    length: 28 - actionPayload1.offset,
    firstNewLine: -1,
    newLines: 0,
  };

  const previousState: EditorState = JSON.parse(JSON.stringify(initialState));
  previousState.sources[sourceId] = source;
  const newState = reducer(previousState, _insert(actionPayload1));
  const newSource = newState.sources[sourceId];

  expect(newSource.totalNewLines).toEqual(0);
  expect(newSource.totalSize).toEqual(28 + actionPayload1.str.length);
  expect(newSource.lastEditClientId).toEqual(clientId);
  expect(newSource.lastEditOffset).toEqual(actionPayload1.offset);
  expect(newSource.lastEditPieceNumber).toEqual(1);
  expect(newSource.piecesCount).toEqual(3);
  expect(newSource.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource.buffers[1]).toEqual(expectedAddBuffer);
  expect(newSource.pieces[0]).toEqual(expected1Piece);
  expect(newSource.pieces[1]).toEqual(expected2Piece);
  expect(newSource.pieces[2]).toEqual(expected3Piece);
});

test("_insert 3", () => {
  const sourceId = 3414132;
  const clientId = 542354;
  const source: Source = createDummySource(
    sourceId,
    "name",
    "Mauris rutrum dolor ut diam."
  );
  const actionPayload1: InsertPayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 15,
    str: "\n",
  };

  const expectedAddBuffer: Buffer = {
    content: actionPayload1.str,
    size: actionPayload1.str.length,
    newLines: [0],
  };
  const expected1Piece: Piece = {
    bufferIndex: 0,
    offset: 0,
    length: actionPayload1.offset,
    firstNewLine: -1,
    newLines: 0,
  };
  const expected2Piece: Piece = {
    bufferIndex: 1,
    offset: 0,
    length: actionPayload1.str.length,
    firstNewLine: 0,
    newLines: 1,
  };
  const expected3Piece: Piece = {
    bufferIndex: 0,
    offset: actionPayload1.offset,
    length: 28 - actionPayload1.offset,
    firstNewLine: -1,
    newLines: 0,
  };

  const previousState: EditorState = JSON.parse(JSON.stringify(initialState));
  previousState.sources[sourceId] = source;
  const newState = reducer(previousState, _insert(actionPayload1));
  const newSource = newState.sources[sourceId];

  expect(newSource.totalNewLines).toEqual(1);
  expect(newSource.totalSize).toEqual(28 + actionPayload1.str.length);
  expect(newSource.lastEditClientId).toEqual(clientId);
  expect(newSource.lastEditOffset).toEqual(actionPayload1.offset);
  expect(newSource.lastEditPieceNumber).toEqual(1);
  expect(newSource.piecesCount).toEqual(3);
  expect(newSource.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource.buffers[1]).toEqual(expectedAddBuffer);
  expect(newSource.pieces[0]).toEqual(expected1Piece);
  expect(newSource.pieces[1]).toEqual(expected2Piece);
  expect(newSource.pieces[2]).toEqual(expected3Piece);
});

test("_insert 4", () => {
  const sourceId = 3414132;
  const clientId = 542354;
  const source: Source = createDummySource(
    sourceId,
    "name",
    "Mauris rutrum dolor ut diam."
  );
  const actionPayload1: InsertPayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 15,
    str: "\n\n",
  };

  const expectedAddBuffer: Buffer = {
    content: actionPayload1.str,
    size: actionPayload1.str.length,
    newLines: [0, 1],
  };
  const expected1Piece: Piece = {
    bufferIndex: 0,
    offset: 0,
    length: actionPayload1.offset,
    firstNewLine: -1,
    newLines: 0,
  };
  const expected2Piece: Piece = {
    bufferIndex: 1,
    offset: 0,
    length: actionPayload1.str.length,
    firstNewLine: 0,
    newLines: 2,
  };
  const expected3Piece: Piece = {
    bufferIndex: 0,
    offset: actionPayload1.offset,
    length: 28 - actionPayload1.offset,
    firstNewLine: -1,
    newLines: 0,
  };

  const previousState: EditorState = JSON.parse(JSON.stringify(initialState));
  previousState.sources[sourceId] = source;
  const newState = reducer(previousState, _insert(actionPayload1));
  const newSource = newState.sources[sourceId];

  expect(newSource.totalNewLines).toEqual(2);
  expect(newSource.totalSize).toEqual(28 + actionPayload1.str.length);
  expect(newSource.lastEditClientId).toEqual(clientId);
  expect(newSource.lastEditOffset).toEqual(actionPayload1.offset);
  expect(newSource.lastEditPieceNumber).toEqual(1);
  expect(newSource.piecesCount).toEqual(3);
  expect(newSource.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource.buffers[1]).toEqual(expectedAddBuffer);
  expect(newSource.pieces[0]).toEqual(expected1Piece);
  expect(newSource.pieces[1]).toEqual(expected2Piece);
  expect(newSource.pieces[2]).toEqual(expected3Piece);
});

test("_insert 5, continous insert", () => {
  const sourceId = 3414132;
  const clientId = 542354;
  const baseText = "Mauris rutrum dolor ut diam.";
  const baseTextLength = baseText.length;
  const source: Source = createDummySource(sourceId, "name", baseText);
  const actionPayload1: InsertPayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 15,
    str: "s",
  };
  const actionPayload2: InsertPayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 16,
    str: "\n",
  };

  const expectedAddBuffer1: Buffer = {
    content: "s",
    size: 1,
    newLines: [],
  };
  const expectedAddBuffer2: Buffer = {
    content: "s\n",
    size: 2,
    newLines: [1],
  };
  const expected1Piece1: Piece = {
    bufferIndex: 0,
    offset: 0,
    length: actionPayload1.offset,
    firstNewLine: -1,
    newLines: 0,
  };
  const expected2Piece1: Piece = {
    bufferIndex: 1,
    offset: 0,
    length: 1,
    firstNewLine: -1,
    newLines: 0,
  };
  const expected3Piece1: Piece = {
    bufferIndex: 0,
    offset: actionPayload1.offset,
    length: 28 - actionPayload1.offset,
    firstNewLine: -1,
    newLines: 0,
  };
  const expected2Piece2: Piece = {
    bufferIndex: 1,
    offset: 0,
    length: 2,
    firstNewLine: 0,
    newLines: 1,
  };

  const previousState: EditorState = JSON.parse(JSON.stringify(initialState));
  previousState.sources[sourceId] = source;
  const newState1 = reducer(previousState, _insert(actionPayload1));
  const newSource1 = newState1.sources[sourceId];

  expect(newSource1.totalNewLines).toEqual(0);
  expect(newSource1.totalSize).toEqual(baseTextLength + 1);
  expect(newSource1.lastEditClientId).toEqual(clientId);
  expect(newSource1.lastEditOffset).toEqual(actionPayload1.offset);
  expect(newSource1.lastEditPieceNumber).toEqual(1);
  expect(newSource1.piecesCount).toEqual(3);
  expect(newSource1.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource1.buffers[1]).toEqual(expectedAddBuffer1);
  expect(newSource1.pieces[0]).toEqual(expected1Piece1);
  expect(newSource1.pieces[1]).toEqual(expected2Piece1);
  expect(newSource1.pieces[2]).toEqual(expected3Piece1);

  const newState2 = reducer(newState1, _insert(actionPayload2));
  const newSource2 = newState2.sources[sourceId];

  expect(newSource2.totalNewLines).toEqual(1);
  expect(newSource2.totalSize).toEqual(baseTextLength + 1 + 1);
  expect(newSource2.lastEditClientId).toEqual(clientId);
  expect(newSource2.lastEditOffset).toEqual(actionPayload2.offset);
  expect(newSource2.lastEditPieceNumber).toEqual(1);
  expect(newSource2.piecesCount).toEqual(3);
  expect(newSource2.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource2.buffers[1]).toEqual(expectedAddBuffer2);
  expect(newSource2.pieces[0]).toEqual(expected1Piece1);
  expect(newSource2.pieces[1]).toEqual(expected2Piece2);
  expect(newSource2.pieces[2]).toEqual(expected3Piece1);
});

test("_insert 6, random insert", () => {
  const sourceId = 3414132;
  const clientId = 542354;
  const baseText = "Mauris rutrum dolor ut diam.";
  const baseTextLength = baseText.length;
  const source: Source = createDummySource(sourceId, "name", baseText);
  const actionPayload1: InsertPayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 15,
    str: "s",
  };
  const actionPayload2: InsertPayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 25,
    str: "\n",
  };

  const expectedAddBuffer1: Buffer = {
    content: "s",
    size: 1,
    newLines: [],
  };
  const expectedAddBuffer2: Buffer = {
    content: "s\n",
    size: 2,
    newLines: [1],
  };
  const expectedPiece1: Piece = {
    bufferIndex: 0,
    offset: 0,
    length: actionPayload1.offset,
    firstNewLine: -1,
    newLines: 0,
  };
  const expectedPiece2: Piece = {
    bufferIndex: 1,
    offset: 0,
    length: 1,
    firstNewLine: -1,
    newLines: 0,
  };
  const expectedPiece3: Piece = {
    bufferIndex: 0,
    offset: actionPayload1.offset,
    length: 28 - actionPayload1.offset,
    firstNewLine: -1,
    newLines: 0,
  };
  const expectedPiece4: Piece = {
    bufferIndex: 0,
    offset: actionPayload1.offset,
    length: 9,
    firstNewLine: -1,
    newLines: 0,
  };
  const expectedPiece5: Piece = {
    bufferIndex: 1,
    offset: 1,
    length: 1,
    firstNewLine: 0,
    newLines: 1,
  };
  const expectedPiece6: Piece = {
    bufferIndex: 0,
    offset: 24,
    length: 4,
    firstNewLine: -1,
    newLines: 0,
  };

  const previousState: EditorState = JSON.parse(JSON.stringify(initialState));
  previousState.sources[sourceId] = source;
  const newState1 = reducer(previousState, _insert(actionPayload1));
  const newSource1 = newState1.sources[sourceId];

  expect(newSource1.totalNewLines).toEqual(0);
  expect(newSource1.totalSize).toEqual(baseTextLength + 1);
  expect(newSource1.lastEditClientId).toEqual(clientId);
  expect(newSource1.lastEditOffset).toEqual(actionPayload1.offset);
  expect(newSource1.lastEditPieceNumber).toEqual(1);
  expect(newSource1.piecesCount).toEqual(3);
  expect(newSource1.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource1.buffers[1]).toEqual(expectedAddBuffer1);
  expect(newSource1.pieces).toEqual([
    expectedPiece1,
    expectedPiece2,
    expectedPiece3,
  ]);

  const newState2 = reducer(newState1, _insert(actionPayload2));
  const newSource2 = newState2.sources[sourceId];

  expect(newSource2.totalNewLines).toEqual(1);
  expect(newSource2.totalSize).toEqual(baseTextLength + 1 + 1);
  expect(newSource2.lastEditClientId).toEqual(clientId);
  expect(newSource2.lastEditOffset).toEqual(actionPayload2.offset);
  expect(newSource2.lastEditPieceNumber).toEqual(3);
  expect(newSource2.piecesCount).toEqual(5);
  expect(newSource2.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource2.buffers[1]).toEqual(expectedAddBuffer2);
  expect(newSource2.pieces).toEqual([
    expectedPiece1,
    expectedPiece2,
    expectedPiece4,
    expectedPiece5,
    expectedPiece6,
  ]);
});

test("_insert 7, splitting piece with new lines", () => {
  const sourceId = 3414132;
  const clientId = 542354;
  const baseText = "Mauris rutrum\n dolor ut diam.";
  const newLinePos = 14;
  const baseTextLength = baseText.length;
  const source: Source = createDummySource(sourceId, "name", baseText);
  source.totalNewLines = 1;
  source.buffers[0].newLines = [newLinePos];
  source.pieces[0].newLines = 1;
  source.pieces[0].firstNewLine = 0;
  const actionPayload1: InsertPayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 10,
    str: "s",
  };
  const actionPayload2: InsertPayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 25,
    str: "\n",
  };

  const expectedAddBuffer1: Buffer = {
    content: "s",
    size: 1,
    newLines: [],
  };
  const expectedAddBuffer2: Buffer = {
    content: "s\n",
    size: 2,
    newLines: [1],
  };
  const expectedPiece1: Piece = {
    bufferIndex: 0,
    offset: 0,
    length: actionPayload1.offset,
    firstNewLine: -1,
    newLines: 0,
  };
  const expectedPiece2: Piece = {
    bufferIndex: 1,
    offset: 0,
    length: 1,
    firstNewLine: -1,
    newLines: 0,
  };
  const expectedPiece3: Piece = {
    bufferIndex: 0,
    offset: actionPayload1.offset,
    length: baseTextLength - actionPayload1.offset,
    firstNewLine: 0,
    newLines: 1,
  };
  const expectedPiece4: Piece = {
    bufferIndex: 0,
    offset: actionPayload1.offset,
    length: 14,
    firstNewLine: 0,
    newLines: 1,
  };
  const expectedPiece5: Piece = {
    bufferIndex: 1,
    offset: 1,
    length: 1,
    firstNewLine: 0,
    newLines: 1,
  };
  const expectedPiece6: Piece = {
    bufferIndex: 0,
    offset: 24,
    length: 5,
    firstNewLine: -1,
    newLines: 0,
  };

  const previousState: EditorState = JSON.parse(JSON.stringify(initialState));
  previousState.sources[sourceId] = source;
  const newState1 = reducer(previousState, _insert(actionPayload1));
  const newSource1 = newState1.sources[sourceId];

  expect(newSource1.totalNewLines).toEqual(1);
  expect(newSource1.totalSize).toEqual(baseTextLength + 1);
  expect(newSource1.lastEditClientId).toEqual(clientId);
  expect(newSource1.lastEditOffset).toEqual(actionPayload1.offset);
  expect(newSource1.lastEditPieceNumber).toEqual(1);
  expect(newSource1.piecesCount).toEqual(3);
  expect(newSource1.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource1.buffers[1]).toEqual(expectedAddBuffer1);
  expect(newSource1.pieces).toEqual([
    expectedPiece1,
    expectedPiece2,
    expectedPiece3,
  ]);

  const newState2 = reducer(newState1, _insert(actionPayload2));
  const newSource2 = newState2.sources[sourceId];

  expect(newSource2.totalNewLines).toEqual(2);
  expect(newSource2.totalSize).toEqual(baseTextLength + 1 + 1);
  expect(newSource2.lastEditClientId).toEqual(clientId);
  expect(newSource2.lastEditOffset).toEqual(actionPayload2.offset);
  expect(newSource2.lastEditPieceNumber).toEqual(3);
  expect(newSource2.piecesCount).toEqual(5);
  expect(newSource2.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource2.buffers[1]).toEqual(expectedAddBuffer2);
  expect(newSource2.pieces).toEqual([
    expectedPiece1,
    expectedPiece2,
    expectedPiece4,
    expectedPiece5,
    expectedPiece6,
  ]);
});

test("_insert 8, splitting piece with new lines", () => {
  const sourceId = 3414132;
  const clientId = 542354;
  const baseText = "lols\nsiema\nsiema\nsiema";
  const baseTextLength = baseText.length;
  const source: Source = createDummySource(sourceId, "name", baseText);
  source.totalNewLines = 4;
  source.buffers[0].newLines = [5, 11, 17, 22];
  source.pieces[0].newLines = 4;
  source.pieces[0].firstNewLine = 0;
  const actionPayload1: InsertPayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 8,
    str: "sss",
  };
  const actionPayload2: InsertPayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 17,
    str: "sss",
  };

  const expectedAddBuffer1: Buffer = {
    content: "sss",
    size: 3,
    newLines: [],
  };
  const expectedAddBuffer2: Buffer = {
    content: "ssssss",
    size: 6,
    newLines: [],
  };
  const expectedPiece1: Piece = {
    bufferIndex: 0,
    offset: 0,
    length: actionPayload1.offset,
    firstNewLine: 0,
    newLines: 1,
  };
  const expectedPiece2: Piece = {
    bufferIndex: 1,
    offset: 0,
    length: 3,
    firstNewLine: -1,
    newLines: 0,
  };
  const expectedPiece3: Piece = {
    bufferIndex: 0,
    offset: actionPayload1.offset,
    length: baseTextLength - actionPayload1.offset,
    firstNewLine: 1,
    newLines: 3,
  };
  const expectedPiece4: Piece = {
    bufferIndex: 0,
    offset: actionPayload1.offset,
    length: 6,
    firstNewLine: 1,
    newLines: 1,
  };
  const expectedPiece5: Piece = {
    bufferIndex: 1,
    offset: 3,
    length: 3,
    firstNewLine: -1,
    newLines: 0,
  };
  const expectedPiece6: Piece = {
    bufferIndex: 0,
    offset: 14,
    length: 8,
    firstNewLine: 2,
    newLines: 2,
  };

  const previousState: EditorState = JSON.parse(JSON.stringify(initialState));
  previousState.sources[sourceId] = source;
  const newState1 = reducer(previousState, _insert(actionPayload1));
  const newSource1 = newState1.sources[sourceId];

  expect(newSource1.totalNewLines).toEqual(4);
  expect(newSource1.totalSize).toEqual(baseTextLength + 3);
  expect(newSource1.lastEditClientId).toEqual(clientId);
  expect(newSource1.lastEditOffset).toEqual(actionPayload1.offset);
  expect(newSource1.lastEditPieceNumber).toEqual(1);
  expect(newSource1.piecesCount).toEqual(3);
  expect(newSource1.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource1.buffers[1]).toEqual(expectedAddBuffer1);
  expect(newSource1.pieces).toEqual([
    expectedPiece1,
    expectedPiece2,
    expectedPiece3,
  ]);

  const newState2 = reducer(newState1, _insert(actionPayload2));
  const newSource2 = newState2.sources[sourceId];

  expect(newSource2.totalNewLines).toEqual(4);
  expect(newSource2.totalSize).toEqual(baseTextLength + 3 + 3);
  expect(newSource2.lastEditClientId).toEqual(clientId);
  expect(newSource2.lastEditOffset).toEqual(actionPayload2.offset);
  expect(newSource2.lastEditPieceNumber).toEqual(3);
  expect(newSource2.piecesCount).toEqual(5);
  expect(newSource2.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource2.buffers[1]).toEqual(expectedAddBuffer2);
  expect(newSource2.pieces).toEqual([
    expectedPiece1,
    expectedPiece2,
    expectedPiece4,
    expectedPiece5,
    expectedPiece6,
  ]);
});

test("_insert 9, insert new line at the end of line", () => {
  const sourceId = 3414132;
  const clientId = 542354;
  const baseText = "lols\nsiema\nsiema\nsiema";
  const baseTextLength = baseText.length;
  const source: Source = createDummySource(sourceId, "name", baseText);
  source.totalNewLines = 4;
  source.buffers[0].newLines = [5, 11, 17, 22];
  source.pieces[0].newLines = 4;
  source.pieces[0].firstNewLine = 0;
  const actionPayload1: InsertPayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 5,
    str: "\n",
  };
  const actionPayload2: InsertPayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 6,
    str: "s",
  };
  const actionPayload3: InsertPayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 6,
    str: "z",
  };

  const expectedAddBuffer1: Buffer = {
    content: "\n",
    size: 1,
    newLines: [0],
  };
  const expectedAddBuffer2: Buffer = {
    content: "\ns",
    size: 2,
    newLines: [0],
  };
  const expectedAddBuffer3: Buffer = {
    content: "\nsz",
    size: 3,
    newLines: [0],
  };
  const expectedPiece1: Piece = {
    bufferIndex: 0,
    offset: 0,
    length: actionPayload1.offset,
    firstNewLine: -1,
    newLines: 0,
  };
  const expectedPiece2: Piece = {
    bufferIndex: 1,
    offset: 0,
    length: 1,
    firstNewLine: 0,
    newLines: 1,
  };
  const expectedPiece3: Piece = {
    bufferIndex: 0,
    offset: actionPayload1.offset,
    length: baseTextLength - actionPayload1.offset,
    firstNewLine: 0,
    newLines: 4,
  };
  const expectedPiece4: Piece = {
    bufferIndex: 1,
    offset: 0,
    length: 2,
    firstNewLine: 0,
    newLines: 1,
  };
  const expectedPiece5: Piece = {
    bufferIndex: 1,
    offset: 2,
    length: 1,
    firstNewLine: -1,
    newLines: 0,
  };
  const expectedPiece6: Piece = {
    bufferIndex: 1,
    offset: 1,
    length: 1,
    firstNewLine: -1,
    newLines: 0,
  };

  const previousState: EditorState = copyObject(initialState);
  previousState.sources[sourceId] = source;
  const newState1 = reducer(previousState, _insert(actionPayload1));
  const newSource1 = newState1.sources[sourceId];

  expect(newSource1.totalNewLines).toEqual(5);
  expect(newSource1.totalSize).toEqual(baseTextLength + 1);
  expect(newSource1.lastEditClientId).toEqual(clientId);
  expect(newSource1.lastEditOffset).toEqual(actionPayload1.offset);
  expect(newSource1.lastEditPieceNumber).toEqual(1);
  expect(newSource1.piecesCount).toEqual(3);
  expect(newSource1.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource1.buffers[1]).toEqual(expectedAddBuffer1);
  expect(newSource1.pieces[0]).toEqual(expectedPiece1);
  expect(newSource1.pieces[1]).toEqual(expectedPiece2);
  expect(newSource1.pieces[2]).toEqual(expectedPiece3);

  const newState2 = reducer(newState1, _insert(actionPayload2));
  const newSource2 = newState2.sources[sourceId];

  expect(newSource2.totalNewLines).toEqual(5);
  expect(newSource2.totalSize).toEqual(baseTextLength + 1 + 1);
  expect(newSource2.lastEditClientId).toEqual(clientId);
  expect(newSource2.lastEditOffset).toEqual(actionPayload2.offset);
  expect(newSource2.piecesCount).toEqual(3);
  expect(newSource2.lastEditPieceNumber).toEqual(1);
  expect(newSource2.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource2.buffers[1]).toEqual(expectedAddBuffer2);
  expect(newSource2.pieces[0]).toEqual(expectedPiece1);
  expect(newSource2.pieces[1]).toEqual(expectedPiece4);
  expect(newSource2.pieces[2]).toEqual(expectedPiece3);

  const newState3 = reducer(newState2, _insert(actionPayload3));
  const newSource3 = newState3.sources[sourceId];

  // console.log(newSource3.pieces);
  expect(newSource3.totalNewLines).toEqual(5);
  expect(newSource3.totalSize).toEqual(baseTextLength + 1 + 1 + 1);
  expect(newSource3.lastEditClientId).toEqual(clientId);
  expect(newSource3.lastEditOffset).toEqual(actionPayload2.offset);
  expect(newSource3.piecesCount).toEqual(5);
  expect(newSource3.lastEditPieceNumber).toEqual(2);
  expect(newSource3.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource3.buffers[1]).toEqual(expectedAddBuffer3);
  expect(newSource3.pieces[0]).toEqual(expectedPiece1);
  expect(newSource3.pieces[1]).toEqual(expectedPiece2);
  expect(newSource3.pieces[2]).toEqual(expectedPiece5);
  expect(newSource3.pieces[3]).toEqual(expectedPiece6);
  expect(newSource3.pieces[4]).toEqual(expectedPiece3);
});

test("_insert 10 with selectors, insert new line at the end of line", () => {
  const sourceId = 3414132;
  const clientId = 542354;
  const baseText = "lols\nsiema\nsiema\nsiema"; // lols\nxs\nsiema\nsiema\nsiema
  const baseTextLength = baseText.length;
  const source: Source = createDummySource(sourceId, "name", baseText);
  source.totalNewLines = 4;
  source.buffers[0].newLines = [4, 10, 16, 22];
  source.pieces[0].newLines = 4;
  source.pieces[0].firstNewLine = 0;
  const actionPayload1: InsertPayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 4,
    str: "\n",
  };
  const actionPayload2: InsertPayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 5,
    str: "s",
  };
  const actionPayload3: InsertPayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 5,
    str: "z",
  };

  const expectedAddBuffer1: Buffer = {
    content: "\n",
    size: 1,
    newLines: [0],
  };
  const expectedAddBuffer2: Buffer = {
    content: "\ns",
    size: 2,
    newLines: [0],
  };
  const expectedAddBuffer3: Buffer = {
    content: "\nsz",
    size: 3,
    newLines: [0],
  };
  const expectedPiece1: Piece = {
    bufferIndex: 0,
    offset: 0,
    length: actionPayload1.offset,
    firstNewLine: -1,
    newLines: 0,
  };
  const expectedPiece2: Piece = {
    bufferIndex: 1,
    offset: 0,
    length: 1,
    firstNewLine: 0,
    newLines: 1,
  };
  const expectedPiece3: Piece = {
    bufferIndex: 0,
    offset: actionPayload1.offset,
    length: baseTextLength - actionPayload1.offset,
    firstNewLine: 0,
    newLines: 4,
  };
  const expectedPiece4: Piece = {
    bufferIndex: 1,
    offset: 0,
    length: 2,
    firstNewLine: 0,
    newLines: 1,
  };
  const expectedPiece5: Piece = {
    bufferIndex: 1,
    offset: 2,
    length: 1,
    firstNewLine: -1,
    newLines: 0,
  };
  const expectedPiece6: Piece = {
    bufferIndex: 1,
    offset: 1,
    length: 1,
    firstNewLine: -1,
    newLines: 0,
  };

  const previousState: EditorState = copyObject(initialState);
  previousState.sources[sourceId] = source;
  const newState1 = reducer(previousState, _insert(actionPayload1));
  const newSource1 = newState1.sources[sourceId];

  expect(newSource1.totalNewLines).toEqual(5);
  expect(newSource1.totalSize).toEqual(baseTextLength + 1);
  expect(newSource1.lastEditClientId).toEqual(clientId);
  expect(newSource1.lastEditOffset).toEqual(actionPayload1.offset);
  expect(newSource1.lastEditPieceNumber).toEqual(1);
  expect(newSource1.piecesCount).toEqual(3);
  expect(newSource1.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource1.buffers[1]).toEqual(expectedAddBuffer1);
  expect(newSource1.pieces[0]).toEqual(expectedPiece1);
  expect(newSource1.pieces[1]).toEqual(expectedPiece2);
  expect(newSource1.pieces[2]).toEqual(expectedPiece3);

  const newState2 = reducer(newState1, _insert(actionPayload2));
  const newSource2 = newState2.sources[sourceId];

  expect(newSource2.totalNewLines).toEqual(5);
  expect(newSource2.totalSize).toEqual(baseTextLength + 1 + 1);
  expect(newSource2.lastEditClientId).toEqual(clientId);
  expect(newSource2.lastEditOffset).toEqual(actionPayload2.offset);
  expect(newSource2.piecesCount).toEqual(3);
  expect(newSource2.lastEditPieceNumber).toEqual(1);
  expect(newSource2.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource2.buffers[1]).toEqual(expectedAddBuffer2);
  expect(newSource2.pieces[0]).toEqual(expectedPiece1);
  expect(newSource2.pieces[1]).toEqual(expectedPiece4);
  expect(newSource2.pieces[2]).toEqual(expectedPiece3);

  const newState3 = reducer(newState2, _insert(actionPayload3));
  const newSource3 = newState3.sources[sourceId];

  // console.log(newSource3.pieces);
  expect(newSource3.totalNewLines).toEqual(5);
  expect(newSource3.totalSize).toEqual(baseTextLength + 1 + 1 + 1);
  expect(newSource3.lastEditClientId).toEqual(clientId);
  expect(newSource3.lastEditOffset).toEqual(actionPayload2.offset);
  expect(newSource3.piecesCount).toEqual(5);
  expect(newSource3.lastEditPieceNumber).toEqual(2);
  expect(newSource3.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource3.buffers[1]).toEqual(expectedAddBuffer3);
  expect(newSource3.pieces[0]).toEqual(expectedPiece1);
  expect(newSource3.pieces[1]).toEqual(expectedPiece2);
  expect(newSource3.pieces[2]).toEqual(expectedPiece5);
  expect(newSource3.pieces[3]).toEqual(expectedPiece6);
  expect(newSource3.pieces[4]).toEqual(expectedPiece3);

  const initialRootState: RootState = copyObject(
    rootReducer(undefined, { type: undefined })
  );
  initialRootState.newEditor = copyObject(newState3);
  initialRootState.newEditor.currentSourceId = sourceId;
  expect(selectPositionOffset(initialRootState, -1, 3)).toEqual(-1);
  expect(selectPositionOffset(initialRootState, 0, -1)).toEqual(-1);
  expect(selectPositionOffset(initialRootState, 10, 1)).toEqual(-1);
  expect(selectPositionOffset(initialRootState, 0, 3)).toEqual(3);
  expect(selectPositionOffset(initialRootState, 1, 0)).toEqual(5);
  expect(selectPositionOffset(initialRootState, 2, 0)).toEqual(8);
  expect(selectPositionOffset(initialRootState, 3, 0)).toEqual(14);
  expect(selectPositionOffset(initialRootState, 4, 0)).toEqual(20);

  const newRootState1 = rootReducer(
    initialRootState,
    _insert({ clientId: clientId, sourceId: sourceId, offset: 10, str: "zs" })
  );

  expect(selectPositionOffset(newRootState1, -1, 3)).toEqual(-1);
  expect(selectPositionOffset(newRootState1, 0, -1)).toEqual(-1);
  expect(selectPositionOffset(newRootState1, 10, 1)).toEqual(-1);
  expect(selectPositionOffset(newRootState1, 0, 3)).toEqual(3);
  expect(selectPositionOffset(newRootState1, 1, 0)).toEqual(5);
  expect(selectPositionOffset(newRootState1, 2, 0)).toEqual(8);
  expect(selectPositionOffset(newRootState1, 3, 0)).toEqual(16);
  expect(selectPositionOffset(newRootState1, 4, 0)).toEqual(22);
});

// ================================== Selectors ========================================
test("selectPositionOffset 1", () => {
  const sourceId = 3414132;
  const clientId = 542354;
  const baseText = "lols\nsiema\nsiema\nsiema";
  const baseTextLength = baseText.length;
  const source: Source = createDummySource(sourceId, "name", baseText);
  source.totalNewLines = 4;
  source.buffers[0].newLines = [4, 10, 16, 22];
  source.pieces[0].newLines = 4;
  source.pieces[0].firstNewLine = 0;

  let initialState: RootState = copyObject(
    rootReducer(undefined, { type: undefined })
  );
  initialState.newEditor.sources[sourceId] = source;
  initialState.newEditor.currentSourceId = sourceId;
  // const newState = rootReducer(initialState, {type: "sdfasfas"});

  expect(selectPositionOffset(initialState, -1, 3)).toEqual(-1);
  expect(selectPositionOffset(initialState, 0, -1)).toEqual(-1);
  expect(selectPositionOffset(initialState, 5, 1)).toEqual(-1);
  expect(selectPositionOffset(initialState, 0, 3)).toEqual(3);
  expect(selectPositionOffset(initialState, 1, 3)).toEqual(8);
  expect(selectPositionOffset(initialState, 2, 3)).toEqual(14);
  expect(selectPositionOffset(initialState, 3, 3)).toEqual(20);

  initialState = copyObject(
    rootReducer(
      initialState,
      _insert({ clientId: clientId, sourceId: sourceId, offset: 10, str: "zs" })
    )
  );

  expect(selectPositionOffset(initialState, -1, 3)).toEqual(-1);
  expect(selectPositionOffset(initialState, 0, -1)).toEqual(-1);
  expect(selectPositionOffset(initialState, 0, 3)).toEqual(3);
  expect(selectPositionOffset(initialState, 1, 3)).toEqual(8);
  expect(selectPositionOffset(initialState, 2, 3)).toEqual(16);
  expect(selectPositionOffset(initialState, 3, 3)).toEqual(22);

  initialState = copyObject(
    rootReducer(
      initialState,
      _insert({ clientId: clientId, sourceId: sourceId, offset: 10, str: "zs" })
    )
  );

  expect(selectPositionOffset(initialState, -1, 3)).toEqual(-1);
  expect(selectPositionOffset(initialState, 0, -1)).toEqual(-1);
  expect(selectPositionOffset(initialState, 0, 3)).toEqual(3);
  expect(selectPositionOffset(initialState, 1, 3)).toEqual(8);
  expect(selectPositionOffset(initialState, 2, 3)).toEqual(18);
  expect(selectPositionOffset(initialState, 3, 3)).toEqual(24);

  initialState = copyObject(
    rootReducer(
      initialState,
      _insert({
        clientId: clientId,
        sourceId: sourceId,
        offset: 0,
        str: "z54s",
      })
    )
  );

  expect(selectPositionOffset(initialState, -1, 3)).toEqual(-1);
  expect(selectPositionOffset(initialState, 0, -1)).toEqual(-1);
  expect(selectPositionOffset(initialState, 0, 3)).toEqual(3);
  expect(selectPositionOffset(initialState, 1, 3)).toEqual(12);
  expect(selectPositionOffset(initialState, 2, 3)).toEqual(22);
  expect(selectPositionOffset(initialState, 3, 3)).toEqual(28);
});

test("selectPositionOffset 2", () => {
  const sourceId = 3414132;
  const clientId = 542354;
  const baseText = "lols\nsiema\nsiema\nsiema";
  const baseTextLength = baseText.length;
  const source: Source = createDummySource(sourceId, "name", baseText);
  source.totalNewLines = 4;
  source.buffers[0].newLines = [5, 11, 17, 22];
  source.pieces[0].newLines = 4;
  source.pieces[0].firstNewLine = 0;

  let initialState: RootState = copyObject(
    rootReducer(undefined, { type: undefined })
  );
  initialState.newEditor = {
    projectId: "4444",
    clientId: 4321324,
    projectTitle: "Jeszcze jeden projekt",
    loading: {
      editor: false,
      createSource: false,
      uploadFile: false,
    },
    cursors: [],
    sources: {
      "4": {
        id: 4,
        name: "nowy plik2",
        pieces: [
          {
            bufferIndex: 0,
            offset: 0,
            length: 15,
            firstNewLine: -1,
            newLines: 0,
          },
          {
            bufferIndex: 1,
            offset: 8,
            length: 1,
            firstNewLine: -1,
            newLines: 0,
          },
          {
            bufferIndex: 1,
            offset: 0,
            length: 8,
            firstNewLine: 0,
            newLines: 1,
          },
          {
            bufferIndex: 0,
            offset: 15,
            length: 49,
            firstNewLine: 0,
            newLines: 5,
          },
        ],
        piecesCount: 4,
        buffers: [
          {
            content:
              "no ale w nowyms\nkoks\nlol\nno i znaczki sďż˝ spoks\nno i gitarnson\n",
            size: 64,
            newLines: [15, 20, 24, 48, 63],
          },
          {
            content: "\nkozackos",
            size: 9,
            newLines: [0],
          },
        ],
        versions: [],
        markers: [],
        totalSize: 73,
        totalNewLines: 6,
        version: 98,
        buffersCount: 2,
        lastEditOffset: 15,
        lastEditClientId: -1,
        lastEditPieceNumber: 1,
      },
    },
    currentSourceId: 4,
    selections: [
      {
        type: SelectionType.N,
        start: {
          line: 0,
          offset: 16,
          totalOffset: 0,
        },
        end: {
          line: 0,
          offset: 16,
          totalOffset: 0,
        },
      },
    ],
    style: {
      width: 1135,
      height: 1183,
      lineHeight: 22,
      fontSize: 16,
      fontFamily: "Source Code Pro, monospace",
      letterWidth: 8.796875,
      lineWidth: 450,
      maxVisibleLinesCount: 55,
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

  expect(selectPositionOffset(initialState, -1, 3)).toEqual(-1);
  expect(selectPositionOffset(initialState, 0, -1)).toEqual(-1);
  expect(selectPositionOffset(initialState, 0, 16)).toEqual(16);
  expect(selectPositionOffset(initialState, 1, 1)).toEqual(18);
  expect(selectPositionOffset(initialState, 2, 0)).toEqual(25);
});

test("selectLines 1", () => {
  const sourceId = 3414132;
  const clientId = 542354;
  const baseText =
    "Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit.\nCras ornare sagittis felis fermentum faucibus.\nNam sed justo eget lectus pulvinar.";
  const baseTextLength = baseText.length;
  const source: Source = createDummySource(sourceId, "name", baseText);
  source.totalNewLines = 4;
  source.buffers[0].newLines = [27, 56, 103, 139];
  source.pieces[0].newLines = 4;
  source.pieces[0].firstNewLine = 0;

  let initialState: RootState = copyObject(
    rootReducer(undefined, { type: undefined })
  );

  initialState.newEditor.sources[sourceId] = source;
  initialState.newEditor.currentSourceId = sourceId;

  initialState.newEditor.style.firstVisibleLine = 0;
  expect(selectLines(initialState, 1)).toEqual(["Lorem ipsum dolor sit amet,"]);
  initialState.newEditor.style.firstVisibleLine = 1;
  expect(selectLines(initialState, 1)).toEqual([
    "consectetur adipiscing elit.",
  ]);
  initialState.newEditor.style.firstVisibleLine = 2;
  expect(selectLines(initialState, 1)).toEqual([
    "Cras ornare sagittis felis fermentum faucibus.",
  ]);
  initialState.newEditor.style.firstVisibleLine = 3;
  expect(selectLines(initialState, 1)).toEqual([
    "Nam sed justo eget lectus pulvinar.",
  ]);

  initialState.newEditor.style.firstVisibleLine = 0;
  expect(selectLines(initialState, 2)).toEqual([
    "Lorem ipsum dolor sit amet,",
    "consectetur adipiscing elit.",
  ]);
  initialState.newEditor.style.firstVisibleLine = 1;
  expect(selectLines(initialState, 2)).toEqual([
    "consectetur adipiscing elit.",
    "Cras ornare sagittis felis fermentum faucibus.",
  ]);
  initialState.newEditor.style.firstVisibleLine = 2;
  expect(selectLines(initialState, 2)).toEqual([
    "Cras ornare sagittis felis fermentum faucibus.",
    "Nam sed justo eget lectus pulvinar.",
  ]);
  initialState.newEditor.style.firstVisibleLine = 0;
  expect(selectLines(initialState, 10)).toEqual([
    "Lorem ipsum dolor sit amet,",
    "consectetur adipiscing elit.",
    "Cras ornare sagittis felis fermentum faucibus.",
    "Nam sed justo eget lectus pulvinar.",
  ]);
});

test("_remove 1", () => {
  const sourceId = 3414132;
  const clientId = 542354;
  const source: Source = createDummySource(
    sourceId,
    "name",
    "Mauris rutrum dolor ut diam."
  );
  const actionPayload1: RemovePayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 15,
    length: 2,
  };

  const expectedAddBuffer: Buffer = {
    content: "",
    size: 0,
    newLines: [],
  };
  const expected1Piece: Piece = {
    bufferIndex: 0,
    offset: 0,
    length: actionPayload1.offset,
    firstNewLine: -1,
    newLines: 0,
  };
  const expected2Piece: Piece = {
    bufferIndex: 0,
    offset: actionPayload1.offset + actionPayload1.length,
    length: 28 - actionPayload1.offset - actionPayload1.length,
    firstNewLine: -1,
    newLines: 0,
  };

  const previousState: EditorState = JSON.parse(JSON.stringify(initialState));
  previousState.sources[sourceId] = source;
  const newState = reducer(previousState, _remove(actionPayload1));
  const newSource = newState.sources[sourceId];

  expect(newSource.totalNewLines).toEqual(0);
  expect(newSource.totalSize).toEqual(28 - actionPayload1.length);
  expect(newSource.lastEditClientId).toEqual(clientId);
  expect(newSource.lastEditOffset).toEqual(actionPayload1.offset);
  expect(newSource.lastEditPieceNumber).toEqual(0);
  expect(newSource.piecesCount).toEqual(2);
  expect(newSource.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource.buffers[1]).toEqual(expectedAddBuffer);
  expect(newSource.pieces[0]).toEqual(expected1Piece);
  expect(newSource.pieces[1]).toEqual(expected2Piece);
});

test("_remove 2", () => {
  const sourceId = 3414132;
  const clientId = 542354;
  const source: Source = createDummySource(
    sourceId,
    "name",
    "Mauris rutrum dolor ut diam."
  );
  const actionPayload1: RemovePayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 15,
    length: 1,
  };
  const actionPayload2: RemovePayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 14,
    length: 1,
  };

  const expectedAddBuffer: Buffer = {
    content: "",
    size: 0,
    newLines: [],
  };
  const expected1Piece: Piece = {
    bufferIndex: 0,
    offset: 0,
    length: actionPayload2.offset,
    firstNewLine: -1,
    newLines: 0,
  };
  const expected2Piece: Piece = {
    bufferIndex: 0,
    offset: actionPayload1.offset + actionPayload1.length,
    length: 28 - actionPayload1.offset - actionPayload1.length,
    firstNewLine: -1,
    newLines: 0,
  };

  const previousState: EditorState = JSON.parse(JSON.stringify(initialState));
  previousState.sources[sourceId] = source;
  const newState = reducer(previousState, _remove(actionPayload1));
  const newState1 = reducer(newState, _remove(actionPayload2));
  const newSource = newState1.sources[sourceId];

  expect(newSource.totalNewLines).toEqual(0);
  expect(newSource.totalSize).toEqual(
    28 - actionPayload1.length - actionPayload2.length
  );
  expect(newSource.lastEditClientId).toEqual(clientId);
  expect(newSource.lastEditOffset).toEqual(actionPayload2.offset);
  expect(newSource.lastEditPieceNumber).toEqual(0);
  expect(newSource.piecesCount).toEqual(2);
  expect(newSource.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource.buffers[1]).toEqual(expectedAddBuffer);
  expect(newSource.pieces[0]).toEqual(expected1Piece);
  expect(newSource.pieces[1]).toEqual(expected2Piece);
});

test("_remove 3", () => {
  const sourceId = 3414132;
  const clientId = 542354;
  const source: Source = createDummySource(
    sourceId,
    "name",
    "Mauris rutrum dolor ut diam."
  );
  const actionPayload1: RemovePayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 15,
    length: 2,
  };
  const actionPayload2: RemovePayload = {
    sourceId: sourceId,
    clientId: clientId,
    offset: 13,
    length: 2,
  };

  const expectedAddBuffer: Buffer = {
    content: "",
    size: 0,
    newLines: [],
  };
  const expected1Piece: Piece = {
    bufferIndex: 0,
    offset: 0,
    length: actionPayload2.offset,
    firstNewLine: -1,
    newLines: 0,
  };
  const expected2Piece: Piece = {
    bufferIndex: 0,
    offset: actionPayload1.offset + actionPayload1.length,
    length: 28 - actionPayload1.offset - actionPayload1.length,
    firstNewLine: -1,
    newLines: 0,
  };

  const previousState: EditorState = JSON.parse(JSON.stringify(initialState));
  previousState.sources[sourceId] = source;
  const newState = reducer(previousState, _remove(actionPayload1));
  const newState1 = reducer(newState, _remove(actionPayload2));
  const newSource = newState1.sources[sourceId];

  expect(newSource.totalNewLines).toEqual(0);
  expect(newSource.totalSize).toEqual(
    28 - actionPayload1.length - actionPayload2.length
  );
  expect(newSource.lastEditClientId).toEqual(clientId);
  expect(newSource.lastEditOffset).toEqual(actionPayload2.offset);
  expect(newSource.lastEditPieceNumber).toEqual(0);
  expect(newSource.piecesCount).toEqual(2);
  expect(newSource.buffers[0]).toEqual(source.buffers[0]);
  expect(newSource.buffers[1]).toEqual(expectedAddBuffer);
  expect(newSource.pieces[0]).toEqual(expected1Piece);
  expect(newSource.pieces[1]).toEqual(expected2Piece);
});
