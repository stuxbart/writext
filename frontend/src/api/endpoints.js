import axios from 'axios'
import getCookie from './csrf';

export const csrftoken = getCookie('csrftoken');

export const authApi = axios.create({
    baseURL: 'http://localhost:8000/auth/',
    headers: {'X-CSRFToken': csrftoken}
});

export const accountsApi = axios.create({
    baseURL: 'http://localhost:8000/accounts/',
    headers: {'X-CSRFToken': csrftoken}
});

export const editorEndpoint = axios.create({
    baseURL: 'http://localhost:8000/editor/',
    auth: {
        username: 'kamil',
        password: 'admin12@'
    }
    
})