import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { register, login } from "../auth/authSlice";
import { createFolder } from "../folders/folderSlice";

export type RegisterErrorResponse = {
  message: string;
  errors: {
    email?: string[];
    username?: string[];
    password?: string[];
  };
};
enum ErrorCode {
  SFDA,
}
type Error = {
  code: ErrorCode;
  msg: string;
};
type ErrorState = {
  general: Error[];
  authLoginError: {
    isSet: boolean;
    message: string;
    fields: {
      username: string;
      password: string;
    };
  };
  authRegisterError: {
    isSet: boolean;
    message: string;
    fields: {
      username: string;
      email: string;
      password: string;
    };
  };
  folderCreateError: {
    isSet: boolean;
    message: string;
  };
};

const initialState: ErrorState = {
  general: [],
  authLoginError: {
    isSet: false,
    message: "",
    fields: {
      username: "",
      password: "",
    },
  },
  authRegisterError: {
    isSet: false,
    message: "",
    fields: {
      username: "",
      email: "",
      password: "",
    },
  },
  folderCreateError: {
    isSet: false,
    message: "",
  },
};

export const errorSlice = createSlice({
  name: "error",
  initialState,
  reducers: {
    setError: {
      reducer(state, action: PayloadAction<Error>) {
        state.general.push(action.payload);
      },
      prepare(errorMessage: string, errorCode: ErrorCode) {
        return {
          payload: {
            code: errorCode,
            msg: errorMessage,
          } as Error,
        };
      },
    },
    clearError(state, action: PayloadAction) {
      state.general = [];
    },
    setAuthLoginError(state, action: PayloadAction<{ message: string }>) {
      const { message } = action.payload;
      state.authLoginError.isSet = true;
      state.authLoginError.message = message;

      // if (fields) Object.keys(fields).forEach(key => {
      //     state.authLoginError.fields[key] = fields[key]
      // })
    },
    clearAuthLoginError(state, action: PayloadAction) {
      state.authLoginError.isSet = false;
      state.authLoginError.message = "";
      state.authLoginError.fields.username = "";
      state.authLoginError.fields.password = "";
    },
    setAuthRegisterError(state, action: PayloadAction<{ message: string }>) {
      const { message } = action.payload;
      state.authRegisterError.isSet = true;
      state.authRegisterError.message = message;

      // if (fields) Object.keys(fields).forEach(key => {
      //     state.authRegisterError.fields[key] = fields[key]
      // })
    },
    clearAuthRegisterError(state, action: PayloadAction) {
      state.authRegisterError.isSet = false;
      state.authRegisterError.message = "";
      state.authRegisterError.fields.email = "";
      state.authRegisterError.fields.username = "";
      state.authRegisterError.fields.password = "";
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(login.pending, (state, action) => {
        state.authLoginError.isSet = false;
        state.authLoginError.message = "";
        state.authLoginError.fields.username = "";
        state.authLoginError.fields.password = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.authLoginError.isSet = false;
        state.authLoginError.message = "";
        state.authLoginError.fields.username = "";
        state.authLoginError.fields.password = "";
      })
      .addCase(login.rejected, (state, action: PayloadAction<any>) => {
        state.authLoginError.isSet = true;
        state.authLoginError.message = action.payload.error;
        state.authLoginError.fields.username = "";
        state.authLoginError.fields.password = "";
      })
      .addCase(register.pending, (state, action) => {
        state.authRegisterError.isSet = false;
        state.authRegisterError.message = "";
        state.authRegisterError.fields.email = "";
        state.authRegisterError.fields.username = "";
        state.authRegisterError.fields.password = "";
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<any>) => {
        state.authRegisterError.isSet = false;
        state.authRegisterError.message = "";
        state.authRegisterError.fields.email = "";
        state.authRegisterError.fields.username = "";
        state.authRegisterError.fields.password = "";
      })
      .addCase(
        register.rejected,
        (state, action: PayloadAction<RegisterErrorResponse | undefined>) => {
          state.authRegisterError.isSet = true;
          if (action.payload === undefined) return;
          state.authRegisterError.message = action.payload.message;
          state.authRegisterError.fields.email =
            action.payload.errors.email?.join("\n") || "";
          state.authRegisterError.fields.username =
            action.payload.errors.username?.join("\n") || "";
          state.authRegisterError.fields.password =
            action.payload.errors.password?.join("\n") || "";
        }
      )
      .addCase(createFolder.pending, (state, action: PayloadAction<any>) => {
        state.folderCreateError.isSet = false;
      })
      .addCase(createFolder.fulfilled, (state, action: PayloadAction<any>) => {
        state.folderCreateError.isSet = false;
      })
      .addCase(createFolder.rejected, (state, action: PayloadAction<any>) => {
        state.folderCreateError.isSet = true;
        state.folderCreateError.message = action.payload.error;
      }),
});

export const {
  setError,
  clearError,
  setAuthLoginError,
  clearAuthLoginError,
  setAuthRegisterError,
  clearAuthRegisterError,
} = errorSlice.actions;

export default errorSlice.reducer;

export const selectLoginErrorStatus = (state: RootState): boolean => {
  return state.error.authLoginError.isSet;
};

export const selectLoginErrorMessage = (state: RootState): string => {
  return state.error.authLoginError.message;
};

export const selecRegistrErrorStatus = (state: RootState): boolean => {
  return state.error.authRegisterError.isSet;
};

export const selectRegisterErrorMessage = (state: RootState): string => {
  return state.error.authRegisterError.message;
};

export const selectRegisterFieldsErrors = (
  state: RootState
): {
  username: string;
  email: string;
  password: string;
} => {
  return state.error.authRegisterError.fields;
};
export const selectFolderCreateErrorStatus = (state: RootState): boolean => {
  return state.error.folderCreateError.isSet;
};
export const selectFolderCreateErrorMessage = (state: RootState): string => {
  return state.error.folderCreateError.message;
};
