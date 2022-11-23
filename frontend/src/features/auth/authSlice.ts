import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { accountsApi } from "../../api/endpoints";
import getCookie from "../../api/csrf";
import { RootState } from "../../store";
import { RegisterErrorResponse } from "../errors/errorSlice";

type AuthState = {
  isAuthenticated: boolean;
  username: string;
  email: string;
  loading: boolean;
  error: boolean;
};
type UserCredentials = {
  username: string;
  password: string;
};
type UserResponseData = {
  isAuthenticated: boolean;
  username: string;
  email: string;
  error: string;
};
type UserRegisterData = {
  username: string;
  email: string;
  password: string;
};
type LogoutData = {
  success: boolean;
};
type RegisterResponseData = {
  message: string;
  errors?: object;
};
const initialState: AuthState = {
  isAuthenticated: false,
  username: "",
  email: "",
  loading: false,
  error: false,
};

export const login = createAsyncThunk<UserResponseData, UserCredentials>(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    const csrftoken = getCookie("csrftoken");
    const config = {
      method: "POST",
      headers: { "X-CSRFToken": csrftoken },
      mode: "same-origin",
    };

    try {
      const response = await accountsApi.post(
        "login",
        { username, password },
        config
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue({ error: error.response.data.error });
    }
  }
);

export const logout = createAsyncThunk<LogoutData, void>(
  "auth/logout",
  async () => {
    const csrftoken = getCookie("csrftoken");
    const config = {
      headers: { "X-CSRFToken": csrftoken },
    };
    const response = await accountsApi.post("logout", {}, config);

    return response.data;
  }
);

export const register = createAsyncThunk<
  RegisterResponseData,
  UserRegisterData,
  { rejectValue: RegisterErrorResponse }
>("auth/register", async (data, thunkApi) => {
  const { email, username, password } = data;
  const csrftoken = getCookie("csrftoken");

  const config = {
    method: "POST",
    headers: { "X-CSRFToken": csrftoken },
    mode: "same-origin",
  };

  try {
    const response = await accountsApi.post(
      "register",
      { email, username, password },
      config
    );
    return response.data;
  } catch (error: any) {
    const err_data: RegisterErrorResponse = {
      ...error.response.data,
    };
    return thunkApi.rejectWithValue(err_data);
  }
});

export const fetchUser = createAsyncThunk<UserResponseData, void>(
  "auth/user_info",
  async () => {
    const response = await accountsApi.get("user-info", {});
    return response.data;
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    testlogin: (state) => {
      state.isAuthenticated = true;
    },
    testlogout: (state) => {
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ================= Login =====================
      .addCase(login.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        const { username, email, isAuthenticated } = action.payload;
        state.username = username || "";
        state.email = email || "";
        state.isAuthenticated = isAuthenticated || false;
      })
      .addCase(login.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.email = "";
        state.username = "";
        state.error = true;
      })
      // ================= Logout =====================
      .addCase(logout.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.email = "";
        state.username = "";
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = true;
      })
      // ================= Register =====================
      .addCase(register.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
      })
      // ================= Fetch user info =====================
      .addCase(fetchUser.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        const { isAuthenticated, username, email } = action.payload;
        state.loading = false;
        state.isAuthenticated = isAuthenticated;
        state.email = email;
        state.username = username;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.isAuthenticated = false;
        state.email = "";
        state.username = "";
      });
  },
});

// export const {} = authSlice.actions;

export default authSlice.reducer;

export const selectAuthenticationStatus = (state: RootState): boolean => {
  return state.auth.isAuthenticated;
};

export const selectUsername = (state: RootState): string => {
  return state.auth.username;
};

export const selectAuthLoading = (state: RootState): boolean => {
  return state.auth.loading;
};
