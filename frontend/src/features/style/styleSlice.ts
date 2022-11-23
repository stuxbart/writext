import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export enum NavbarStyle {
  Gradient,
  White,
}

type StyleState = {
  navbarStyle: NavbarStyle;
  editor: {
    showFiles: boolean;
    showMenu: boolean;
  };
};

const initialState: StyleState = {
  navbarStyle: NavbarStyle.Gradient,
  editor: {
    showFiles: false,
    showMenu: false,
  },
};

export const styleSlice = createSlice({
  name: "style",
  initialState,
  reducers: {
    setGradientNavbar: (state) => {
      state.navbarStyle = NavbarStyle.Gradient;
    },
    setWhiteNavbar: (state) => {
      state.navbarStyle = NavbarStyle.White;
    },
    openFileMenu(state, action) {
      state.editor.showFiles = true;
    },
    closeFileMenu(state, action) {
      state.editor.showFiles = false;
    },
    openMenu(state, action) {
      state.editor.showMenu = true;
    },
    closeMenu(state, action) {
      state.editor.showMenu = false;
    },
  },
});

export const {
  setGradientNavbar,
  setWhiteNavbar,
  openFileMenu,
  closeFileMenu,
  openMenu,
  closeMenu,
} = styleSlice.actions;

export default styleSlice.reducer;

export const selectNavStyle = (state: RootState): NavbarStyle => {
  return state.style.navbarStyle;
};
