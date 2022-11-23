import { Middleware } from "redux";
import { RootState } from "../store";
import { fetchProject } from "../features/projects/projectSlice";
import {
  insert,
  remove,
  resetSelections,
  setScrollOffset,
  setSource,
} from "../features/editor/newEditorSlice";
import { replaceCRLF } from "../utils";

export const editorMiddleware: Middleware<{}, RootState> =
  (storeApi) => (next) => (action) => {
    // const state = storeApi.getState();
    let res;

    if (fetchProject.fulfilled.match(action)) {
      storeApi.dispatch(resetSelections());
    } else if (setSource.match(action)) {
      storeApi.dispatch(resetSelections());
      storeApi.dispatch(setScrollOffset(0));
    } else if (insert.match(action)) {
      // replace CLRF
      const newAction = {
        ...action,
        payload: { ...action.payload, str: replaceCRLF(action.payload.str) },
      };
      return next(newAction);
    } else if (remove.match(action)) {
    }
    res = next(action);

    return res;
  };
