import React from "react";
import Modal, { ActionData } from "../Modal";
import {
  hideInfoModal,
  selectInfoModalOpen,
  selectInfoModalData,
} from "../../../features/modals/modalSlice";
import "./InfoModal.scss";
import { useAppDispatch, useAppSelector } from "../../../hooks";

function InfoModal(): JSX.Element {
  const open = useAppSelector(selectInfoModalOpen);
  const { message, title } = useAppSelector(selectInfoModalData);
  const dispatch = useAppDispatch();

  const onClose = (e: React.SyntheticEvent) => {
    dispatch(hideInfoModal());
  };

  const actions: ActionData[] = [
    { name: "Ok", onClick: onClose, style: "priamry" },
  ];
  return (
    <Modal open={open} title={title} onClose={onClose} actions={actions}>
      <div className="modal__message">{message}</div>
    </Modal>
  );
}
export default InfoModal;
