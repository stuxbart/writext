import { Middleware } from "redux";
import { RootState } from "../store";

// trach file changes and perform undo/redo operations
export const historytMiddleware: Middleware<{}, RootState> =
  (storeApi) => (next) => (action) => {
    // const state = storeApi.getState();

    return next(action);
  };
