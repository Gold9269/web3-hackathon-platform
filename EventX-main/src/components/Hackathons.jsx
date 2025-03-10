import React from 'react'
import { useSelector } from 'react-redux'

function Hackathons() {
  const authState = useSelector(state => state.auth);
  console.log("Redux State:", authState);
  return (
    <div>Hackathons</div>
  )
}

export default Hackathons
