import React from "react";
import CreateProjectModal from "./CreateProjectModal";
import InfoModal from "./InfoModal";
import UpdateProjectInfoModal from "./UpdateProjectInfoModal";
import DeleteProjectModal from "./DeleteProjectModal";
import CreateFolderModal from "./CreateFolderModal";
import DeleteFolderModal from "./DeleteFolderModal";
import UpdateFolderModal from "./UpdateFolderModal";
import CreateFileModal from "./CreateFileModal";
import { useAppSelector } from "../../hooks";
import {
  selectCreateFileModalOpen,
  selectCreateFolderModalOpen,
  selectCreateProjectModalOpen,
  selectDeleteFolderModalOpen,
  selectDeleteProjectModalOpen,
  selectInfoModalOpen,
  selectUpdateFolderModalOpen,
  selectUpdateProjectModalOpen,
  selectShareProjectModalOpen,
  selectUploadFileModalOpen,
} from "../../features/modals/modalSlice";
import ShareProjectModal from "./ShareProjectModal";
import UploadFileModal from "./FileUploadModal";

function Modals(): JSX.Element {
  const infoModalOpen = useAppSelector(selectInfoModalOpen);
  const createProjectModalOpen = useAppSelector(selectCreateProjectModalOpen);
  const updateProjectModalOpen = useAppSelector(selectUpdateProjectModalOpen);
  const deleteProjectModalOpen = useAppSelector(selectDeleteProjectModalOpen);
  const shareProjectModalOpen = useAppSelector(selectShareProjectModalOpen);

  const createFolderModalOpen = useAppSelector(selectCreateFolderModalOpen);
  const updateFolderModalOpen = useAppSelector(selectUpdateFolderModalOpen);
  const deleteFolderModalOpen = useAppSelector(selectDeleteFolderModalOpen);

  const createFileModalOpen = useAppSelector(selectCreateFileModalOpen);
  const uploadFileModalOpen = useAppSelector(selectUploadFileModalOpen);

  return (
    <>
      {infoModalOpen && <InfoModal />}
      {createProjectModalOpen && <CreateProjectModal />}
      {updateProjectModalOpen && <UpdateProjectInfoModal />}
      {deleteProjectModalOpen && <DeleteProjectModal />}
      {shareProjectModalOpen && <ShareProjectModal />}

      {createFolderModalOpen && <CreateFolderModal />}
      {updateFolderModalOpen && <UpdateFolderModal />}
      {deleteFolderModalOpen && <DeleteFolderModal />}

      {createFileModalOpen && <CreateFileModal />}
      {uploadFileModalOpen && <UploadFileModal />}
    </>
  );
}

export default Modals;
