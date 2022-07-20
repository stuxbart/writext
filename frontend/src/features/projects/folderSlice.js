import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import getCookie from '../../api/csrf'
import { editorEndpoint } from '../../api/endpoints'

const initialState = {
    entities: {},
    allIds: [],
    rootIds: [],
    count: 0,
    loading: false,
    selectedFolderId: null
}

export const fetchFolders = createAsyncThunk('folders/fetchFolders', async () => {
    const response = await editorEndpoint.get('folders/', {})
    return response.data
})

export const createFolder = createAsyncThunk('folders/createFolder', async (title) => {
    const headers = {
        'X-CSRFtoken': getCookie('csrftoken')
    }
    const response = await editorEndpoint.post('folders/', {title:title}, {headers })
    return response.data
})


export const folderSlice = createSlice({
    name:'folders',
    initialState,
    reducers: {
        selectFolder(state, action) {
            state.selectedFolderId = action.payload
        },
        deselectFolder(state, action) {
            state.selectedFolderId = null
        }
    },
    extraReducers: builder => {
        builder
        .addCase(fetchFolders.pending, (state, action) => {
            state.loading = true
        })
        .addCase(fetchFolders.fulfilled, (state, action) => {
            const { count, entities, allIds, rootIds } = action.payload

            const res = entities.reduce(function(map, obj) {
                map[obj.id] = obj
                return map
            }, {})

            state.entities = res
            state.allIds = allIds
            state.rootIds = rootIds
            state.count = count

            state.loading = false
        })
        .addCase(createFolder.fulfilled, (state, action) => {
            console.log(action.payload)
        })
    }
})

// Action creators are generated for each case reducer function
export const { selectFolder, deselectFolder } = folderSlice.actions

export default folderSlice.reducer