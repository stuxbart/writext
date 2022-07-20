import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCookie } from '../../api/csrf'
import { editorEndpoint } from '../../api/endpoints'

const initialState = {
    entities: {},
    allIds: [],
    count: 0,
    loading: false
}

export const fetchProjects = createAsyncThunk('projects/fetchProjects', async () => {
    const response = await editorEndpoint.get('projects/', {})
    return response.data
})


export const projectSlice = createSlice({
    name:'projects',
    initialState,
    reducers: {

    },
    extraReducers: builder => {
        builder
        .addCase(fetchProjects.pending, (state, action) => {
            state.loading = true
        })
        .addCase(fetchProjects.fulfilled, (state, action) => {
            Object.assign(state.entities, action.payload)
            const keys = Object.keys(state.entities)
            state.allIds = keys
            state.count = keys.lenght
            state.loading = false
        })
    }
})

// Action creators are generated for each case reducer function
// export const { increment, decrement, incrementByAmount } = projectSlice.actions

export default projectSlice.reducer