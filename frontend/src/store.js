import { configureStore } from '@reduxjs/toolkit'

import authReducer from './features/auth/authSlice'
import errorReducer from './features/errors/errorSlice'
import projectReducer from './features/projects/projectSlice'
import folderReducer from './features/projects/folderSlice'

export default configureStore({
    reducer: {
        auth: authReducer,
        error: errorReducer,
        project: projectReducer,
        folder: folderReducer,
    }
})