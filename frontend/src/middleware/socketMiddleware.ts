import { Middleware, MiddlewareAPI } from "redux";
import { RootState } from "../store";
import { fetchProject } from "../features/projects/projectSlice";
import {
  insert,
  _insert,
  remove,
  _remove,
  setCLientId,
  setSourceVersion,
  compile,
  setCompileResult,
  selectPositionOffset,
} from "../features/editor/newEditorSlice";

const SOCKET_ENDPOINT = "ws://localhost:8000/ws/editor/";

enum OperationType {
  Insert = "insert",
  Delete = "delete",
}
type OperationData = {
  type: OperationType;
  offset: number;
  str?: string;
  length?: number;
};
type OperationsPayload = {
  clientId: number;
  fileId: number;
  ver: number;
  operations: OperationData[];
};

const onOpen = () => {
  // console.log("CONNECTION ESTABILISHED");
};

const onClose = () => {
  // console.log("CONNECTION CLOSED");
};

const onMessage =
  (storeApi: MiddlewareAPI, cachedChanges: ChangeType[]) =>
  (message: MessageEvent) => {
    const data = JSON.parse(message.data);
    const state = storeApi.getState();

    // Check if there is an error
    if (data.error) {
      console.error("ERROR", data.error);
      return;
    }

    // If no error parse data
    // set client id received from server
    if (data.clientId) {
      storeApi.dispatch(setCLientId(parseInt(data.clientId)));
      return;
    }
    // Sync current files state
    // Data versions contains list of file versions
    // required to have up-to-date file contents
    if (data.versions) {
      const sourceId = data.versions[0].fileId;
      const source = state.newEditor.sources[sourceId];
      const lastVer = source.version;
      let newerVersions: boolean = false;

      // loop over versions to find unapplied ones
      for (let i = data.versions.length - 1; i > -1; i--) {
        const version = data.versions[i];
        const fileId = version.fileId;

        // check if contains current version
        if (!newerVersions) {
          for (let j = 0; j < version.prevVersions.length; j++) {
            const ver = version.prevVersions[j];
            if (ver === lastVer) {
              newerVersions = true;
              break;
            }
          }
        }
        if (!newerVersions) {
          continue;
        }

        for (let j = 0; j < version.changes.length; j++) {
          const op = version.changes[j];

          // check if operation was already applied
          let alreadyApplied: boolean = false;
          for (let k = 0; k < cachedChanges.length; k++) {
            const change = cachedChanges[k];
            if (
              // insert check
              change.offset === op.pos &&
              change.str === op.val &&
              change.sourceId === fileId
            ) {
              alreadyApplied = true;
              cachedChanges.splice(k, 1);
              break;
            }

            if (
              // remove check
              change.offset === op.pos &&
              change.length === op.val.length &&
              change.sourceId === fileId
            ) {
              alreadyApplied = true;
              cachedChanges.splice(k, 1);
              break;
            }
          }

          // insert if not applied
          if (op.type === "insertion" && !alreadyApplied) {
            storeApi.dispatch(
              _insert({
                sourceId: fileId,
                offset: op.pos,
                str: op.val,
                clientId: op.user,
              })
            );
          } // remove if not applied
          else if (op.type === "removal" && !alreadyApplied) {
            storeApi.dispatch(
              _remove({
                sourceId: fileId,
                offset: op.pos,
                length: op.val.length,
                clientId: op.user,
              })
            );
          }
        }
      }

      storeApi.dispatch(
        setSourceVersion({
          fileId: data.versions[0].fileId,
          ver: data.versions[0].ver,
        })
      );
    }

    if (data.text && data.text.value) {
      storeApi.dispatch(
        setCompileResult({
          link: "http://localhost:8000" + data.text.value.link,
          error: data.text.value.error,
        })
      );
    }
  };

type ChangeType = {
  offset: number;
  sourceId: number;
  str?: string;
  length?: number;
};

export const socketMiddleware: Middleware<{}, RootState> = (storeApi) => {
  let socket: WebSocket | undefined;
  let appliedChange: ChangeType[] = [];
  let cachedChanges: OperationData[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined = undefined;

  const sendChanges = (state: RootState, fileId: number) => {
    if (timer === undefined)
      timer = setTimeout(() => {
        const data: OperationsPayload = {
          ver: state.newEditor.sources[fileId].version,
          clientId: state.newEditor.clientId,
          fileId: fileId,
          operations: cachedChanges,
        };
        if (socket) socket.send(JSON.stringify(data));
        cachedChanges = [];
        timer = undefined;
      }, 1000);
  };

  return (next) => (action) => {
    const isConnected: number | boolean = socket?.OPEN || false;
    const state = storeApi.getState();

    // Connect to websocket of current project
    if (fetchProject.fulfilled.match(action)) {
      const projectId = action.payload.id;
      // close socket if already exist
      if (socket !== undefined) {
        socket.close();
      }
      socket = new WebSocket(SOCKET_ENDPOINT + `${projectId}/`);
      // add socket event listeners
      socket.onopen = onOpen;
      socket.onclose = onClose;
      socket.onmessage = onMessage(storeApi, appliedChange);
      next(action);
    } else if (insert.match(action)) {
      const selections = state.newEditor.selections;

      for (const selection of selections) {
        const state = storeApi.getState();
        const totalInsertOffset = selectPositionOffset(
          state,
          selection.end.line,
          selection.end.offset
        );
        appliedChange.push({
          offset: totalInsertOffset,
          sourceId: action.payload.sourceId,
          str: action.payload.str,
        });

        if (isConnected && socket !== undefined) {
          const offset = totalInsertOffset;
          const fileId = action.payload.sourceId;

          const operationData: OperationData = {
            type: OperationType.Insert,
            offset: offset,
            str: action.payload.str,
          };
          cachedChanges.push(operationData);

          sendChanges(state, fileId);
        }
        storeApi.dispatch(
          _insert({ ...action.payload, offset: totalInsertOffset })
        );
      }
      // // send inserted data to server
      // appliedChange.push({
      //   offset: action.payload.offset,
      //   sourceId: action.payload.sourceId,
      //   str: action.payload.str,
      // });

      // if (isConnected && socket !== undefined) {
      //   const offset = action.payload.offset;
      //   const fileId = action.payload.sourceId;

      //   const operationData: OperationData = {
      //     type: OperationType.Insert,
      //     offset: offset,
      //     str: action.payload.str,
      //   };
      //   cachedChanges.push(operationData);

      //   sendChanges(state, fileId);
      // }
      // storeApi.dispatch(_insert(action.payload));
      next(action);
    } else if (remove.match(action)) {
      // send inserted data to server
      const selection = state.newEditor.selections[0];
      const startOffset = selectPositionOffset(
        state,
        selection.start.line,
        selection.start.offset
      );
      const endOffset = selectPositionOffset(
        state,
        selection.end.line,
        selection.end.offset
      );
      const samePoint = endOffset === startOffset;
      const length = samePoint ? 1 : endOffset - startOffset;
      const fileId = action.payload.sourceId;
      const offset = samePoint ? startOffset - 1 : startOffset;
      appliedChange.push({
        offset: offset,
        sourceId: fileId,
        length: length,
      });
      // appliedChange.push({
      //   offset: action.payload.offset,
      //   sourceId: action.payload.sourceId,
      //   length: action.payload.length,
      // });
      if (isConnected && socket !== undefined) {
        const operationData: OperationData = {
          type: OperationType.Delete,
          offset: offset,
          length: length,
        };
        cachedChanges.push(operationData);

        sendChanges(state, fileId);
        storeApi.dispatch(
          _remove({ ...action.payload, offset: offset, length: length })
        );

        // const offset = action.payload.offset;

        // const operationData: OperationData = {
        //   type: OperationType.Delete,
        //   offset: offset,
        //   length: action.payload.length,
        // };
        // cachedChanges.push(operationData);

        // sendChanges(state, fileId);
      }
      // storeApi.dispatch(_remove(action.payload));
      next(action);
    } else if (compile.match(action)) {
      if (isConnected && socket !== undefined) {
        socket.send(JSON.stringify({ compile: action.payload }));
        next(action);
      }
    } else {
      next(action);
    }
  };
};
