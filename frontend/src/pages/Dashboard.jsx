import React from 'react'
import Navigation from '../components/layout/Navigation';

const Dashboard = () => {

  const handleLogout=()=>{
    console.log('logging out')
  };
  return (
    <div>
      <Navigation/>
    </div>

  )
}

export default Dashboard