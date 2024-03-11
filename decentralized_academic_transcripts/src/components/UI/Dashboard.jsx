import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './Navbar';
// Material UI

import Container from '@mui/material/Container';
function Dashboard() {
  return (
    <>
      <CssBaseline />
      <Container>
        {/* Navbar */}
        <Navbar/>
        {/* Any Other Componenets */}
        <ToastContainer
            position="top-center"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            />
        <Outlet/>  
      </Container>
    </>
  );
}

export default Dashboard;