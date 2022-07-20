import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    isSet: false,
    errorType: null,
    errorMessage: "",
    errorCode: 0
}


export const errorSlice = createSlice({
    name: 'error',
    initialState,
    reducers: {
        setError : {
            reducer(state, action) {
                const { isSet, errorType, errorMessage, errorCode } = action.payload
                state.isSet = isSet
                state.errorType = errorType
                state.errorMessage = errorMessage
                state.errorCode = errorCode
            },
            prepare(errorType, errorMessage, errorCode){
                
                return {
                    payload: {
                    isSet: true,
                    errorType:errorType,
                    errorMessage:errorMessage,
                    errorCode:errorCode
                }}
            }
        },
        clearError(state, action) {
            state.isSet = false
            state.errorType = null
            state.errorMessage = ""
            state.errorCode = 0
        }
    }
})

export const {setError, clearError} = errorSlice.actions

export default errorSlice.reducer