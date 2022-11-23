import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { fetchProjectAuthors } from "../projects/projectSlice";

type BasicModalProp = {
  isOpen: boolean;
};
type ExtendedModalPropInt = {
  isOpen: boolean;
  id: number;
};
type ExtendedModalPropString = {
  isOpen: boolean;
  id: string;
};
type InfoModalProp = {
  isOpen: boolean;
  title: string;
  message: string;
};

type FileCreateModalProp = BasicModalProp & {
  projectId: string;
};
type FileUploadModalProp = BasicModalProp & {
  projectId: string;
};
type UserData = {
  id: number;
  email: string;
  username: string;
};
type ProjectShareModalProp = BasicModalProp & {
  id: string;
  authors: UserData[];
  loading: boolean;
};

type ModalState = {
  infoModal: InfoModalProp;
  folders: {
    create: BasicModalProp;
    update: ExtendedModalPropInt;
    delete: ExtendedModalPropInt;
  };
  projects: {
    create: BasicModalProp;
    update: ExtendedModalPropString;
    delete: ExtendedModalPropString;
    share: ProjectShareModalProp;
  };
  files: {
    create: FileCreateModalProp;
    update: ExtendedModalPropInt;
    delete: ExtendedModalPropInt;
    upload: FileUploadModalProp;
  };
};

const initialState: ModalState = {
  infoModal: {
    isOpen: false,
    title: "",
    message: "",
  },
  folders: {
    create: {
      isOpen: false,
    },
    update: {
      isOpen: false,
      id: -1,
    },
    delete: {
      isOpen: false,
      id: -1,
    },
  },
  projects: {
    create: {
      isOpen: false,
    },
    update: {
      isOpen: false,
      id: "",
    },
    delete: {
      isOpen: false,
      id: "",
    },
    share: {
      isOpen: false,
      id: "",
      authors: [],
      loading: true,
    },
  },
  files: {
    create: {
      isOpen: false,
      projectId: "",
    },
    update: {
      isOpen: false,
      id: -1,
    },
    delete: {
      isOpen: false,
      id: -1,
    },
    upload: {
      isOpen: false,
      projectId: "",
    }
  },
};

export const modalSlice = createSlice({
  name: "modals",
  initialState,
  reducers: {
    // ========== Info Modal ============
    showInfoModal(
      state,
      action: PayloadAction<{ message: string; title: string }>
    ) {
      state.infoModal.isOpen = true;
      state.infoModal.message = action.payload.message;
      state.infoModal.title = action.payload.title;
    },
    hideInfoModal(state, action: PayloadAction) {
      state.infoModal.isOpen = false;
      state.infoModal.message = "";
      state.infoModal.title = "";
    },

    // ============ Folder modals ===============
    showFolderCreateModal(state, action: PayloadAction) {
      state.folders.create.isOpen = true;
    },
    hideFolderCreateModal(state, action: PayloadAction) {
      state.folders.create.isOpen = false;
    },
    showFolderUpdateModal(state, action: PayloadAction<number>) {
      state.folders.update.isOpen = true;
      state.folders.update.id = action.payload;
    },
    hideFolderUpdateModal(state, action: PayloadAction) {
      state.folders.update.isOpen = false;
      state.folders.update.id = -1;
    },
    showFolderDeleteModal(state, action: PayloadAction<number>) {
      state.folders.delete.isOpen = true;
      state.folders.delete.id = action.payload;
    },
    hideFolderDeleteModal(state, action: PayloadAction) {
      state.folders.delete.isOpen = false;
      state.folders.delete.id = -1;
    },

    // ============ Projects modals ===============
    showProjectCreateModal(state, action: PayloadAction) {
      state.projects.create.isOpen = true;
    },
    hideProjectCreateModal(state, action: PayloadAction) {
      state.projects.create.isOpen = false;
    },
    showProjectUpdateModal(state, action: PayloadAction<string>) {
      state.projects.update.isOpen = true;
      state.projects.update.id = action.payload;
    },
    hideProjectUpdateModal(state, action: PayloadAction) {
      state.projects.update.isOpen = false;
      state.projects.update.id = "";
    },
    showProjectDeleteModal(state, action: PayloadAction<string>) {
      state.projects.delete.isOpen = true;
      state.projects.delete.id = action.payload;
    },
    hideProjectDeleteModal(state, action: PayloadAction) {
      state.projects.delete.isOpen = false;
      state.projects.delete.id = "";
    },
    showProjectShareModal(state, action: PayloadAction<string>) {
      state.projects.share.isOpen = true;
      state.projects.share.id = action.payload;
    },
    hideProjectShareModal(state, action: PayloadAction) {
      state.projects.share.isOpen = false;
      state.projects.share.id = "";
    },

    // ============ Files modals ===============
    showFileCreateModal(state, action: PayloadAction<string>) {
      state.files.create.isOpen = true;
      state.files.create.projectId = action.payload;
    },
    hideFileCreateModal(state, action: PayloadAction) {
      state.files.create.isOpen = false;
      state.files.create.projectId = "";
    },
    showFileUpdateModal(state, action: PayloadAction<number>) {
      state.files.update.isOpen = true;
      state.files.update.id = action.payload;
    },
    hideFileUpdateModal(state, action: PayloadAction) {
      state.files.update.isOpen = false;
      state.files.update.id = -1;
    },
    showFileDeleteModal(state, action: PayloadAction<number>) {
      state.files.delete.isOpen = true;
      state.files.delete.id = action.payload;
    },
    hideFileDeleteModal(state, action: PayloadAction) {
      state.files.delete.isOpen = false;
      state.files.delete.id = -1;
    },
    showFileUploadModal(state, action: PayloadAction<string>) {
      state.files.upload.isOpen = true;
      state.files.upload.projectId = action.payload;
    },
    hideFileUploadModal(state, action: PayloadAction) {
      state.files.upload.isOpen = false;
      state.files.upload.projectId = "";
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchProjectAuthors.pending, (state, action) => {
        state.projects.share.loading = true;
      })
      .addCase(fetchProjectAuthors.fulfilled, (state, action) => {
        state.projects.share.authors = action.payload;
        state.projects.share.loading = false;
      })
      .addCase(fetchProjectAuthors.rejected, (state, action) => {
        state.projects.share.loading = false;
      }),
});

export const {
  showInfoModal,
  hideInfoModal,

  showFolderCreateModal,
  hideFolderCreateModal,
  showFolderDeleteModal,
  hideFolderDeleteModal,
  showFolderUpdateModal,
  hideFolderUpdateModal,

  showProjectCreateModal,
  hideProjectCreateModal,
  showProjectUpdateModal,
  hideProjectUpdateModal,
  showProjectDeleteModal,
  hideProjectDeleteModal,
  showProjectShareModal,
  hideProjectShareModal,

  showFileCreateModal,
  hideFileCreateModal,
  showFileUpdateModal,
  hideFileUpdateModal,
  showFileDeleteModal,
  hideFileDeleteModal,
  showFileUploadModal,
  hideFileUploadModal,
} = modalSlice.actions;

export default modalSlice.reducer;

export const selectInfoModalOpen = (state: RootState): boolean => {
  return state.modals.infoModal.isOpen;
};

export const selectInfoModalData = (
  state: RootState
): { title: string; message: string } => {
  return {
    message: state.modals.infoModal.message || "",
    title: state.modals.infoModal.title || "",
  };
};

export const selectCreateFileModalOpen = (state: RootState): boolean => {
  return state.modals.files.create.isOpen;
};

export const selectCreateFileModalData = (state: RootState): string => {
  return state.modals.files.create.projectId;
};

export const selectUploadFileModalOpen = (state: RootState): boolean => {
  return state.modals.files.upload.isOpen;
};

export const selectUploadFileModalData = (state: RootState): string => {
  return state.modals.files.upload.projectId;
};

export const selectCreateFolderModalOpen = (state: RootState): boolean => {
  return state.modals.folders.create.isOpen;
};

export const selectUpdateFolderModalOpen = (state: RootState): boolean => {
  return state.modals.folders.update.isOpen;
};

export const selectUpdateFolderModalData = (state: RootState): number => {
  return state.modals.folders.update.id || -1;
};

export const selectDeleteFolderModalOpen = (state: RootState): boolean => {
  return state.modals.folders.delete.isOpen;
};

export const selectDeleteFoldertModalData = (state: RootState): number => {
  return state.modals.folders.delete.id || -1;
};

export const selectCreateProjectModalOpen = (state: RootState): boolean => {
  return state.modals.projects.create.isOpen;
};

export const selectUpdateProjectModalOpen = (state: RootState): boolean => {
  return state.modals.projects.update.isOpen;
};

export const selectUpdateProjectModalData = (
  state: RootState
): string | undefined => {
  return state.modals.projects.update.id;
};

export const selectDeleteProjectModalOpen = (state: RootState): boolean => {
  return state.modals.projects.delete.isOpen;
};

export const selectDeleteProjectModalData = (
  state: RootState
): string | undefined => {
  return state.modals.projects.delete.id;
};

export const selectShareProjectModalOpen = (state: RootState): boolean => {
  return state.modals.projects.share.isOpen;
};

export const selectShareProjectModalData = (state: RootState) => {
  return state.modals.projects.share;
};
