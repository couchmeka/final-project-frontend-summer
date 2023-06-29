import {setHeaderToken} from './setHeaderToken'

export const checkAuthToken = () => {
    let jwtToken = localStorage.getItem('jwtToken')
 
    if (jwtToken) {
        // set headers
        setHeaderToken(jwtToken)
        // set auth is true
        // console.log('!@-------isAuth-------@!')
        // console.log('True')
        return true
        

    } else {
        // delete headers
        setHeaderToken()
        // set auth to false
        // console.log('!@-------isAuth-------@!')
        // console.log('False')
        return false
    }
}