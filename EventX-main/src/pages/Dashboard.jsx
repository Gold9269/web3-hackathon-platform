import React from 'react'
import { useSelector } from "react-redux";


function Dashboard() {
    const user = useSelector((state) => state.auth.userData)
  return (
    <div>{user}</div>
  )
}

export default Dashboard