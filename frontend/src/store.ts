import {
  combineReducers,
  configureStore,
  PreloadedState,
} from "@reduxjs/toolkit";

import authReducer from "./features/auth/authSlice";
import errorReducer from "./features/errors/errorSlice";
import projectReducer from "./features/projects/projectSlice";
import folderReducer from "./features/folders/folderSlice";
import modalReducer from "./features/modals/modalSlice";
import styleReducer from "./features/style/styleSlice";
import { socketMiddleware } from "./middleware/socketMiddleware";
import newEditorSlice from "./features/editor/newEditorSlice";
import { historytMiddleware } from "./middleware/historyMiddleware";
import { editorMiddleware } from "./middleware/editorMiddleware";

export const rootReducer = combineReducers({
  auth: authReducer,
  error: errorReducer,
  project: projectReducer,
  folder: folderReducer,
  modals: modalReducer,
  style: styleReducer,
  newEditor: newEditorSlice,
});

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware({ serializableCheck: false }).concat([
        historytMiddleware,
        editorMiddleware,
        socketMiddleware,
      ]);
    },
  });
};
export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export default store;
