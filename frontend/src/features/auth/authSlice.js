import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { accountsApi } from '../../api/endpoints'
import getCookie from '../../api/csrf';
import { setError } from '../errors/errorSlice'



const initialState = {
    isAuthenticated: false,
    username: "",
    email: "",
    loading: false,
    error: false,
}

export const login = createAsyncThunk('auth/login', async data => {
    const { username, password } = data
    const csrftoken = getCookie('csrftoken');
    const config = {
        method: 'POST',
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin'
    }
    
    const response = await accountsApi.post('login', {username, password}, config)
    return response.data
})

export const logout = createAsyncThunk('auth/logout', async () => {
    const csrftoken = getCookie('csrftoken');
    const response = await accountsApi.post('logout', {}, {headers: {'X-CSRFToken': csrftoken}})
    return response.data
})


export const register = createAsyncThunk('auth/register', async (data) => {
    const { email, username, password } = data
    const csrftoken = getCookie('csrftoken');
    const config = {
        method: 'POST',
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin'
    }
    
    const response = await accountsApi.post('register', { email, username, password }, config)
    return response.data
})


export const fetchUser = createAsyncThunk('auth/user_info', async () => {
    const response = await accountsApi.get('user-info', {})
    return response.data
})


export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    testlogin: (state) => {
      state.isAuthenticated = true
    },
    testlogout: (state) => {
        state.isAuthenticated = false
    }
  },
  extraReducers: builder => {
    builder
    .addCase(login.pending, (state, action) => {
        state.loading = true
    })
    .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        const { username, email, isAuthenticated } = action.payload
        state.username = username || ""
        state.email = email || ""
        state.isAuthenticated = isAuthenticated || false
    })
    .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.email = ""
        state.username = ""
        state.error = true
        setError(12, "Login error", 21)
    })

    .addCase(logout.pending, (state, action) => {
        state.loading = true
    })
    .addCase(logout.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.email = ""
        state.username = ""
    })
    .addCase(logout.rejected, (state, action) => {
        state.error = true
        setError(12, "Login error", 21)
    })
    
    .addCase(fetchUser.pending, (state, action) => {
        state.loading = true
    })
    .addCase(fetchUser.fulfilled, (state, action) => {
        const { isAuthenticated, username, email } = action.payload 
        state.loading = false
        state.isAuthenticated = isAuthenticated
        state.email = email
        state.username = username
    })
    .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false
        state.error = true
        state.isAuthenticated = false
        state.email = ""
        state.username = ""
        setError(12, "Login error", 21)
    })
  }
})

// Action creators are generated for each case reducer function
export const { increment, decrement, incrementByAmount } = authSlice.actions

export default authSlice.reducer