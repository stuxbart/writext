import React from 'react';
import { useDispatch } from 'react-redux'
import { clearError } from '../../features/errors/errorSlice'
import CloseButton from '../CloseButton';

function ErrorBar({ errMessage, show=false }) {
    const dispatch = useDispatch()

    if (!show) return ""

    return (
    <div className="px-3 pt-2 border-bottom bg-danger">
        <div className="container d-flex flex-wrap justify-content-center text-white">
            <p className="lead ">
                {errMessage}
            </p>

            <CloseButton onClick={e => dispatch(clearError())} />
        </div>
    </div>
    )
}


export default ErrorBar
