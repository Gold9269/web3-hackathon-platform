import './App.css'
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authService from './backend/auth.js';
import { useEffect } from 'react';
import { login,logout } from './store/authSlice.js';

function App() {
  const dispatch = useDispatch();

  useEffect(()=>{
    authService.getCurrentUser()
    .then((userData)=>{
      if(userData){
        dispatch(login({userData:userData.user}))
      }else{
        dispatch(logout())
      }
    })
  },[])

  return (
   <div className='flex flex-col min-h-screen '>
    <Header/>
    <main className='flex-1'>
    <Outlet/>
    </main>
    <Footer/>
  </div>
  )
}

export default App
