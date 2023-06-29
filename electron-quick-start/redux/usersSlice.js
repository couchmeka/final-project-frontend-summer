import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Axios from '../lib/Axios'
import { authSuccess } from './authSlice'

//thunk middleware
//createAsyncThunk, first parameter is the action.type, then the function
// the function takes in the payload data from the dispatch
export const registerUser = createAsyncThunk('user/registerUser', async payloadData => {
    // call to the API/backend
    let response = await Axios.post('/users/register', payloadData)

    //return, sets action.payload
    // return {
    //     data: response.data //--> action.payload.user = response.data
    // }
    // breaks down to
    // dispatch {
    //     type: 'user/registerUser',
    //     payload: {user:response.data}
    // }

    return response.data

})

//login
export const login = createAsyncThunk('user/login', async(userData, thunkAPI) => {
    try {
        
        let response = await Axios.post('/users/login', userData)
        // console.log(userData.isRemember)
        //remember me button checked
        // userData.isRemember && localStorage.setItem('jwtToken', response.data.token)

        localStorage.setItem('jwtToken', response.data.token)

        //dispatch authSuccess with Thunk API
        thunkAPI.dispatch(authSuccess())

        return response.data

    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})


export const usersSlice = createSlice({
    name: 'user',
    initialState: {
        email: '',
        password: '',
        firstname: '',
        lastname: '',
        message: '',
        status: null
    },
    //syncronous set state
    reducers: {
        setUser: (state, action) => {
            return {
                ...action.payload,
                password: ''
            }
        },
        resetStatus: (state) => {
            state.status = null
        },
        resetUser: (state) => {
            return {
                email: '',
                password: '',
                firstname: '',
                lastname: '',
                message: 'User Logged Out!',
                status: null
            }
        }
    },
    //asycronous set state
    extraReducers: builder => {
        builder
            .addCase(registerUser.fulfilled, (state, action) => {
                // console.log(action.payload)
                // whole state replacement - use a return
                // return {
                //     email: action.payload.data.userObj.email,
                //     firstname: action.payload.data.userObj.firstname,
                //     lastname: action.payload.data.userObj.lastname,
                //     password: '',
                //     message: action.payload.data.message
                // }

                // modifying the state directly
                // state.firstname = action.payload.firstname 
                // state.lastname = action.payload.lastname
                // state.email = action.payload.email
                // state.message = action.payload.message
                // state.password = ''

                return {
                    ...action.payload,
                    password: '',
                    status: 'fulfilled'
                }
            })
            // .addCase(registerUser.fulfilled, (state, action) => action.payload)
            .addCase(registerUser.rejected, (state) => {
                console.log('!@-------registerUser Error!-------@!')
                state.status = 'rejected'
            })
            .addCase(registerUser.pending, (state) => {
                state.status = 'pending'
            })
            .addCase(login.fulfilled, (state, action)=> {
                state.firstname = action.payload.user.firstname 
                state.lastname = action.payload.user.lastname
                state.email = action.payload.user.email
                state.message = action.payload.message
                state.password = ''
                state.status = 'fulfilled'
            })
            .addCase(login.pending, (state) => {
                state.status = 'pending'
            })
            .addCase(login.rejected, (state, action) => {
                state.message = action.payload
                state.status = 'rejected'
            })
    }
})

 export const { setUser, resetStatus, resetUser } = usersSlice.actions

export default usersSlice.reducer