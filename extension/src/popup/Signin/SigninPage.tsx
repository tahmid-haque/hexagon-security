import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Card, Box, Button, Typography, Tab } from '@mui/material';
import '../popup.css'
import './signin.css'

const onClickSignin = () => {
    chrome.tabs.create({active:true, url:"http://localhost:3000/authenticate"});
}

const SigninPage = () => {

  return (
    <div className='signin-page'>
      <div className='signin-dialog'>
        <div className='signin-message'>You are not logged in</div>
        <Button variant="outlined" color="inherit" size='large' onClick={onClickSignin}>Sign In</Button>
      </div>
    </div>
  )
}

export default SigninPage;