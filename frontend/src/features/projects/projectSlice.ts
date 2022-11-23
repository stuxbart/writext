import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import getCookie from "../../api/csrf";
import { editorEndpoint } from "../../api/endpoints";
import { RootState } from "../../store";

export type ProjectEntity = {
  id: string;
  title: string;
  owner: number;
  created: string;
  updated: string;
  newChanges: boolean;
  todo: boolean;
  folder?: number;

  isOwner: boolean;
  canShare: boolean;
  canEdit: boolean;
  canView: boolean;
  canDelete: boolean;

  last_compile_link: string;
  last_edited_file: number;
};
export type FullProjectEntity = ProjectEntity & {
  files: any;
  mediaFiles: any[];
};
type ProjectEntities = {
  [index: string]: ProjectEntity;
};
type ProjectsResponseData = {
  count: number;
  entities: ProjectEntity[];
  allIds: string[];
};
type ProjectCreateData = {
  title: string;
  folderId?: number;
};
type ProjectUpdateData = {
  id: string;
  title: string;
  folderId?: number;
};
type ProjectDeleteData = {
  id: string;
};
type ProjectShareData = {
  id: string;
  emails: string[];
};
type AuthorData = {
  id: number;
  email: string;
  username: string;
};
type ProjectDeleteResponseData = {};

type ProjectShareResponseData = {
  accepted: string[];
  rejected: string[];
};
export enum ProjectFilter {
  All,
  Owned,
  Shared,
}
type ProjectState = {
  entities: ProjectEntities;
  allIds: string[];
  count: number;
  loading: {
    fetch: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };

  filter: ProjectFilter;
};
const initialState: ProjectState = {
  entities: {},
  allIds: [],
  count: 0,
  loading: {
    fetch: false,
    create: false,
    update: false,
    delete: false,
  },
  filter: ProjectFilter.All,
};

export const fetchProject = createAsyncThunk<FullProjectEntity, string>(
  "editor/fetch",
  async (id) => {
    // const { id } = data;

    const response = await editorEndpoint.get(`projects/${id}/`);
    return response.data;
  }
);

export const fetchProjectAuthors = createAsyncThunk<AuthorData[], string>(
  "editor/fetchAuthors",
  async (id) => {
    const response = await editorEndpoint.get(`projects/${id}/authors/`);
    return response.data;
  }
);

export const fetchProjects = createAsyncThunk<ProjectsResponseData, void>(
  "projects/fetchProjects",
  async () => {
    const response = await editorEndpoint.get("projects/", {});
    return response.data;
  }
);

export const createProject = createAsyncThunk<ProjectEntity, ProjectCreateData>(
  "projects/createProject",
  async (data, thunkApi) => {
    const { title, folderId } = data;
    const csrftoken = getCookie("csrftoken");
    const config = {
      method: "POST",
      headers: { "X-CSRFToken": csrftoken },
      mode: "same-origin",
    };

    try {
      const response = await editorEndpoint.post(
        "projects/",
        { title, folder: folderId },
        config
      );
      return response.data;
    } catch (err: any) {
      return thunkApi.rejectWithValue(err.response.data);
    }
  }
);

export const updateProject = createAsyncThunk<ProjectEntity, ProjectUpdateData>(
  "projects/updateProject",
  async (data, thunkApi) => {
    const { id, title, folderId } = data;
    const csrftoken = getCookie("csrftoken");
    const config = {
      method: "POST",
      headers: { "X-CSRFToken": csrftoken },
      mode: "same-origin",
    };

    try {
      const response = await editorEndpoint.patch(
        `projects/${id}/`,
        { title, folder: folderId },
        config
      );
      return response.data;
    } catch (err: any) {
      return thunkApi.rejectWithValue(err.response.data);
    }
  }
);

export const deleteProject = createAsyncThunk<
  ProjectDeleteResponseData,
  ProjectDeleteData
>("projects/deleteProject", async (data, thunkApi) => {
  const { id } = data;
  const csrftoken = getCookie("csrftoken");
  const config = {
    method: "POST",
    headers: { "X-CSRFToken": csrftoken },
    mode: "same-origin",
  };

  try {
    const response = await editorEndpoint.delete(`projects/${id}/`, config);
    return response.data;
  } catch (err: any) {
    return thunkApi.rejectWithValue(err.response.data);
  }
});

export const shareProject = createAsyncThunk<
  ProjectShareResponseData,
  ProjectShareData
>("projects/shareProject", async (data, thunkApi) => {
  const { id, emails } = data;
  const csrftoken = getCookie("csrftoken");
  const config = {
    method: "POST",
    headers: { "X-CSRFToken": csrftoken },
    mode: "same-origin",
  };
  const requestData = {
    users: emails,
  };
  try {
    const response: any = await editorEndpoint.post(
      `projects/${id}/share_project/`,
      requestData,
      config
    );
    return response.data;
  } catch (err: any) {
    return thunkApi.rejectWithValue(err.response.data);
  }
});

export const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearProjects(state, action: PayloadAction) {
      state.entities = {};
      state.allIds = [];
      state.count = 0;
    },

    setFilter(state, action: PayloadAction<ProjectFilter>) {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========== Fetch Projects ==========
      .addCase(fetchProjects.pending, (state, action: PayloadAction) => {
        state.loading.fetch = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        const { count, entities, allIds } = action.payload;

        const mappedEntities: ProjectEntities = {};
        entities.forEach((item) => {
          mappedEntities[item.id] = item;
        });

        state.entities = mappedEntities;
        state.allIds = allIds;
        state.count = count;

        state.loading.fetch = false;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading.fetch = false;
      })

      // ========== Create Project ==========
      .addCase(createProject.pending, (state, action) => {
        state.loading.create = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        const instance = action.payload;
        state.entities[instance.id] = instance;
        state.count = state.count + 1;
        state.allIds.push(instance.id);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading.create = false;
      })

      // ========== Update Project ==========
      .addCase(updateProject.pending, (state, action) => {
        state.loading.update = true;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const instance = action.payload;
        state.entities[instance.id] = {
          ...state.entities[instance.id],
          ...instance,
        };
        state.loading.update = false;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading.update = false;
      })

      // ========== Delete Project ==========
      .addCase(deleteProject.pending, (state, action) => {
        state.loading.delete = true;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        const instanceId = action.meta.arg.id;
        delete state.entities[instanceId];
        state.count = state.count - 1;
        state.allIds = state.allIds.filter(
          (projectId) => projectId !== instanceId
        );

        state.loading.delete = false;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading.delete = false;
      })

      // ========== Share Project ==========
      .addCase(shareProject.pending, (state, action) => {
        // console.log("shareProject.pending");
      })
      .addCase(shareProject.fulfilled, (state, action) => {
        // console.log("shareProject.fullfiled");
      })
      .addCase(shareProject.rejected, (state, action) => {
        // console.log("shareProject.rejected");
        state.loading.delete = false;
      });
  },
});

export const { clearProjects, setFilter } = projectSlice.actions;

export default projectSlice.reducer;

export const selectProjectEntities = (state: RootState): ProjectEntities => {
  return state.project.entities;
};

export const selectProjectAllIds = (state: RootState): string[] => {
  switch (state.project.filter) {
    case ProjectFilter.All:
      return state.project.allIds;
    case ProjectFilter.Owned:
      return state.project.allIds.filter((proj) => {
        const projectEntity = state.project.entities[proj];
        return projectEntity?.isOwner;
      });
    case ProjectFilter.Shared:
      return state.project.allIds.filter((proj) => {
        const projectEntity = state.project.entities[proj];
        if (projectEntity === undefined) return false;
        if (projectEntity.isOwner === true) return false;
        return true;
      });
    default:
      break;
  }
  return state.project.allIds;
};

export const selectProjectById = (
  state: RootState,
  projectId: string | undefined
): ProjectEntity | undefined => {
  if (projectId === undefined) {
    return undefined;
  }
  if (!state.project.allIds.includes(projectId)) {
    return undefined;
  }
  return state.project.entities[projectId];
};

export const selectProjectFilter = (state: RootState): ProjectFilter => {
  return state.project.filter;
};

export const selectProjectsFetchStatus = (state: RootState): boolean => {
  return state.project.loading.fetch;
};
