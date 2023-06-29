import Axios from './Axios'

export const setHeaderToken = token => {
    if (token) {
        Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
        delete Axios.defaults.headers.common['Authorization']
    }
}