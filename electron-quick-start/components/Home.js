import { Box, Container, Typography, Button, Grid } from '@mui/material';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { authCheck, logout } from '../redux/authSlice';
import arduinoLogo from '../images/arduinologo.png'

const Home = () => {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth.isAuth);
  const users = useSelector(state => state.users);

  useEffect(() => {
    dispatch(authCheck());
  }, [auth]);

  return (
    <Container maxWidth='lg'>
      <Box my={4} textAlign='center'>
        <Typography variant='h2' gutterBottom>
          Welcome to Arduino Sensor Kit Application
        </Typography>
        <img src={arduinoLogo} alt="Arduino logo" className="arduino-logo"style={{ width: '200px', height: 'auto' }} />


        <Typography variant='h3' gutterBottom>
          {auth ? `Welcome back, ${users.firstname}` : `Please Login`}
        </Typography>
      </Box>

      <Grid container spacing={2} justifyContent="center">
        {auth ?
          <Grid item>
            <Button variant="contained" onClick={() => dispatch(logout())}>Logout</Button>
          </Grid>
          :
          <>
            <Grid item>
              <Button variant="contained" href="#/login">Login</Button>
            </Grid>
            <Grid item>
              <Button variant="contained" href="#/register">Register</Button>
            </Grid>
          </>
        }
      </Grid>
    </Container>
  )
}

export default Home;
