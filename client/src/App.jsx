// import { useState } from 'react'
import axios from 'axios'
import RegisterAndLogin from "./pages/RegisterAndLogin";
import { useUserContext } from './context/userContext';
import Chat from './pages/Chat';


axios.defaults.baseURL = 'http://localhost:1337'
axios.defaults.withCredentials = true;



function App() {
  const {state: {username}} = useUserContext()
  if(username) {
    return <Chat />
  }
  return (
    <>
      <RegisterAndLogin />
    </>
  );
}

export default App
