import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from "@reduxjs/toolkit";
import getCookie from "../../api/csrf";
import { editorEndpoint } from "../../api/endpoints";
import { RootState } from "../../store";
import {
  deleteProject,
  ProjectEntity,
  selectProjectAllIds,
  selectProjectEntities,
} from "../projects/projectSlice";

const ROOT_FOLDER_ID = -1;

type FolderPermission = {
  id: number;
  canShare: boolean;
  canEdit: boolean;
  canView: boolean;
  canDelete: boolean;
  owner: number;
  created: string;
  updated: string;
};
export type FolderEntity = {
  id: number;
  title: string;
  owner: number;
  projects: string[];
  folders: number[];
  parent_folder?: number;
  is_root: boolean;
  created: string;
  updated: string;
  permissions: FolderPermission[];
};
type FolderEntities = {
  [index: number]: FolderEntity;
};
type FoldersResponseData = {
  count: number;
  entities: FolderEntity[];
  rootIds: number[];
  allIds: number[];
};
type FolderCreateData = {
  title: string;
  parent_folder?: number;
};
type FolderUpdateData = {
  id: number;
  title: string;
};
export enum FolderFilter {
  All,
  Owned,
  Shared,
}
type FolderState = {
  entities: FolderEntities;
  allIds: number[];
  rootIds: number[];
  count: number;
  selectedFolderId: number;

  loading: {
    fetch: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };

  filter: FolderFilter;
};
const initialState: FolderState = {
  entities: {},
  allIds: [],
  rootIds: [],
  count: 0,
  selectedFolderId: -1,

  loading: {
    fetch: false,
    create: false,
    update: false,
    delete: false,
  },

  filter: FolderFilter.All,
};

export const fetchFolders = createAsyncThunk<FoldersResponseData, void>(
  "folders/fetchFolders",
  async () => {
    const response = await editorEndpoint.get("folders/", {});
    return response.data;
  }
);

export const createFolder = createAsyncThunk<FolderEntity, FolderCreateData>(
  "folders/createFolder",
  async (data, thunkApi) => {
    const headers = {
      "X-CSRFtoken": getCookie("csrftoken"),
    };

    try {
      const response: any = await editorEndpoint.post("folders/", data, {
        headers,
      });
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response.data);
    }
  }
);

export const updateFolder = createAsyncThunk<FolderEntity, FolderUpdateData>(
  "folders/updateFolder",
  async (data, thunkApi) => {
    const { id, title } = data;
    const headers = {
      "X-CSRFtoken": getCookie("csrftoken"),
    };

    try {
      const response = await editorEndpoint.patch(
        `folders/${id}/`,
        { title: title },
        { headers }
      );
      return response.data;
    } catch (err: any) {
      thunkApi.rejectWithValue(err.response.data);
    }
  }
);

export const deleteFolder = createAsyncThunk<void, { id: number }>(
  "folders/deleteDolder",
  async ({ id }, thunkApi) => {
    const headers = {
      "X-CSRFtoken": getCookie("csrftoken"),
    };
    try {
      const response = await editorEndpoint.delete(`folders/${id}/`, {
        headers,
      });

      return response.data;
    } catch (err: any) {
      return thunkApi.rejectWithValue(err.response.data);
    }
  }
);

export const folderSlice = createSlice({
  name: "folders",
  initialState,
  reducers: {
    selectFolder(state, action: PayloadAction<number>) {
      state.selectedFolderId = action.payload;
    },
    deselectFolder(state, action: PayloadAction) {
      state.selectedFolderId = ROOT_FOLDER_ID;
    },

    removeProjectFromFolder: {
      reducer(
        state,
        action: PayloadAction<{ folderId: number; projectId: string }>
      ) {
        const { folderId, projectId } = action.payload;

        if (state.entities[folderId] !== undefined) {
          const index = state.entities[folderId].projects.indexOf(projectId);
          if (index > -1) state.entities[folderId].projects.splice(index, 1);
        }
      },
      prepare(folderId: number, projectId: string) {
        return {
          payload: {
            folderId,
            projectId,
          },
        };
      },
    },

    clearFolders(state, action: PayloadAction) {
      state.entities = {};
      state.allIds = [];
      state.rootIds = [];
      state.count = 0;
      state.selectedFolderId = ROOT_FOLDER_ID;
    },

    setFilter(state, action: PayloadAction<FolderFilter>) {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      // ========== Fetch Folders ===============
      .addCase(fetchFolders.pending, (state, action) => {
        state.loading.fetch = true;
      })
      .addCase(
        fetchFolders.fulfilled,
        (state, action: PayloadAction<FoldersResponseData>) => {
          const { count, entities, allIds, rootIds } = action.payload;

          const mappedEntities: FolderEntities = {};
          entities.forEach((item) => {
            mappedEntities[item.id] = item;
          });

          state.entities = mappedEntities;
          state.allIds = allIds;
          state.rootIds = rootIds;
          state.count = count;

          state.loading.fetch = false;
        }
      )
      .addCase(fetchFolders.rejected, (state, action) => {
        state.loading.fetch = false;
      })

      // ========== Create Folders ===============
      .addCase(createFolder.pending, (state, action) => {
        state.loading.create = true;
      })
      .addCase(
        createFolder.fulfilled,
        (state, action: PayloadAction<FolderEntity>) => {
          const instance = action.payload;

          state.entities[instance.id] = instance;
          state.count = state.count + 1;
          state.allIds.push(instance.id);

          if (instance.parent_folder == null) state.rootIds.push(instance.id);
          else state.entities[instance.parent_folder].folders.push(instance.id);

          state.loading.create = false;
        }
      )
      .addCase(createFolder.rejected, (state, action) => {
        state.loading.create = false;
      })

      // ========== Update Folders ===============
      .addCase(updateFolder.pending, (state, action) => {
        state.loading.update = true;
      })
      .addCase(updateFolder.fulfilled, (state, action) => {
        const folderId = action.payload.id;
        state.entities[folderId] = action.payload;
        state.loading.update = false;
      })
      .addCase(updateFolder.rejected, (state, action) => {
        state.loading.update = false;
      })

      // ========== Delete Folders ===============
      .addCase(deleteFolder.pending, (state, action) => {
        state.loading.delete = true;
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        const folderId = action.meta.arg.id;
        state.allIds = state.allIds.filter((id) => id !== folderId);
        state.rootIds = state.rootIds.filter((id) => id !== folderId);

        const parentFolderId = state.entities[folderId].parent_folder;
        if (parentFolderId !== undefined && parentFolderId !== null) {
          const parentFolder = state.entities[parentFolderId];
          const index = parentFolder.folders.indexOf(folderId);
          if (index > -1)
            state.entities[parentFolderId].folders.splice(index, 1);
        }

        state.count = state.allIds.length;
        delete state.entities[folderId];
        state.loading.delete = false;
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.loading.delete = false;
      })

      // ========== Remove project from folder =========
      .addCase(deleteProject.fulfilled, (state, action) => {
        const projectId = action.meta.arg.id;
        state.allIds.forEach((folderId) => {
          if (state.entities[folderId] !== undefined) {
            const index = state.entities[folderId].projects.indexOf(projectId);
            if (index > -1) state.entities[folderId].projects.splice(index, 1);
          }
        });
      });
  },
});

export const {
  selectFolder,
  deselectFolder,
  removeProjectFromFolder,
  clearFolders,
  setFilter,
} = folderSlice.actions;

export default folderSlice.reducer;

export const selectFolderEntities = (state: RootState): FolderEntities => {
  return state.folder.entities;
};

export const selectFolderAllIds = (state: RootState): number[] => {
  switch (state.folder.filter) {
    case FolderFilter.All:
      return state.folder.allIds;
    case FolderFilter.Owned:
      return state.folder.allIds;
    case FolderFilter.Shared:
      return [];
    default:
      break;
  }
  return state.folder.allIds;
};

export const selectFolderRootIds = (state: RootState): number[] => {
  switch (state.folder.filter) {
    case FolderFilter.All:
      return state.folder.rootIds;
    case FolderFilter.Owned:
      return state.folder.rootIds;
    case FolderFilter.Shared:
      return [];
    default:
      break;
  }
  return state.folder.rootIds;
};

export const selectCurrentFolderId = (state: RootState): number => {
  return state.folder.selectedFolderId;
};

export const selectParentFolders = (
  state: RootState,
  folderId: number | undefined,
  includeFolder: boolean = true
): FolderEntity[] => {
  if (folderId === undefined) {
    return [];
  }
  if (!state.folder.allIds.includes(folderId)) {
    return [];
  }

  const folders = state.folder.entities;
  let currentFolder: FolderEntity = folders[folderId];
  let perentFolders: FolderEntity[] = [];
  const MAX_RECURSION = 20;
  let i = 0;

  if (includeFolder) {
    perentFolders.push(currentFolder);
  }

  while (
    currentFolder !== undefined &&
    currentFolder.parent_folder !== undefined &&
    currentFolder.parent_folder !== null
  ) {
    currentFolder = folders[currentFolder.parent_folder];
    perentFolders.push(currentFolder);

    i++;
    if (i > MAX_RECURSION) {
      break;
    }
  }

  perentFolders = perentFolders.reverse();

  return perentFolders;
};

export const selectFolderById = (
  state: RootState,
  folderId: number
): FolderEntity | undefined => {
  if (!state.folder.allIds.includes(folderId)) {
    return undefined;
  }
  return state.folder.entities[folderId];
};

export const selectFolderFilter = (state: RootState): FolderFilter => {
  return state.folder.filter;
};

export const selectFolderPathStr = createSelector(
  [
    (state: RootState) => state,
    (state: RootState, folderId: number | undefined) => folderId,
    (state: RootState, folderId: number | undefined) =>
      selectParentFolders(state, folderId, true),
  ],
  (state, folderId, parentFolders) => {
    let strFolderPath = "Home/";
    const parentFoldersCount = parentFolders.length;

    for (let index = 0; index < parentFoldersCount; index++) {
      const element = parentFolders[index];
      strFolderPath += element.title + "/";
    }
    return strFolderPath;
  }
);

export const selectCurrentFolder = createSelector(
  [(state: RootState) => state, selectCurrentFolderId],
  (state, currentFolderId): FolderEntity | undefined => {
    return selectFolderById(state, currentFolderId);
  }
);

export const selectCurrentFolderProjectsAndSubfolders = createSelector(
  [
    (state: RootState) => state,
    (state: RootState) => selectCurrentFolderId(state),
    (state: RootState) => selectCurrentFolder(state),
    (state: RootState) => selectFolderEntities(state),
    (state: RootState) => selectProjectEntities(state),
    (state: RootState) => selectFolderRootIds(state),
    (state: RootState) => selectProjectAllIds(state),
  ],
  (
    state,
    currentFolderId,
    currentFolder,
    folders,
    projects,
    folderRootIds,
    projectAllIds
  ): [FolderEntity[], ProjectEntity[]] => {
    let folderIds: number[] = [];
    let projectIds: string[] = [];

    if (currentFolderId === ROOT_FOLDER_ID) {
      folderIds = folderRootIds;
      projectIds = projectAllIds.filter(
        (projectId) => projects[projectId].folder === null
      );
    } else if (currentFolder === undefined) {
      folderIds = [];
      projectIds = [];
    } else {
      folderIds = currentFolder.folders;
      projectIds = currentFolder.projects;
    }
    const folderEntities = [];
    const projectEntities = [];

    for (const folderId of folderIds) {
      folderEntities.push(folders[folderId]);
    }

    for (const projectId of projectIds) {
      projectEntities.push(projects[projectId]);
    }

    const sortByTitle = (a: any, b: any) =>
      a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1;
    folderEntities.sort(sortByTitle);
    projectEntities.sort(sortByTitle);
    return [folderEntities, projectEntities];
  }
);

export const selectCurrentFolderContentByQuery = createSelector(
  [
    (state: RootState) => state,
    (state: RootState) => selectCurrentFolderProjectsAndSubfolders(state),
    (state: RootState, query: string) => query,
  ],
  (state, folderContent, query): [FolderEntity[], ProjectEntity[]] => {
    if (!query) {
      return folderContent;
    }
    const q = query.toLowerCase();
    const folders = folderContent[0].filter((folder) =>
      folder.title.toLowerCase().includes(q)
    );
    const projects = folderContent[1].filter((project) =>
      project.title.toLowerCase().includes(q)
    );

    return [folders, projects];
  }
);
