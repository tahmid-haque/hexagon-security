import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Card, Box, Button, Typography, Tab } from '@mui/material';
import {  TabContext, TabList, TabPanel } from '@mui/lab';
import '../popup.css'
import '../Signin/signin.css'
import PopupPasswords from '../Passwords/Passwords'
import PasswordGenerator from '../PasswordGenerator/PasswordGenerator';
import MFAKeyForm from '../MFAKey/MFAKeys';

const onLogOut = () => {
    chrome.storage.local.clear();
    window.close(); 
  }

const UserGreeting = ({ name }: {name: string}) => {
  
  return (
    <div className='container'>
      <Box mb={"2px"}>
        <Card>
          <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
            <div className='greeting'>Hello {name}...</div>
            <Button variant="outlined" color="primary" sx={{px:"8px", m:"10px", height:"30px", fontSize:13}} onClick={onLogOut}>Sign Out</Button>
          </Box>
        </Card>
      </Box>
    </div>
  )
}

const PopupBody = ({ name, url }: {name:string, url:string}) => {
  const [value, setValue] = React.useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (

    <div className='home-container'>
      <UserGreeting name={name} />

      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={value}>
          <Box sx={{backgroundColor: '#f2f2f2', marginBottom: "0px"}}>
            <TabList onChange={handleChange} aria-label="chrome extension popup tabs">
              <Tab label="Home" value="1"/>
              <Tab label="Generator" value="2" />
              <Tab label="2FA Keys" value="3" />
            </TabList>
          </Box>
          <TabPanel value="1" sx={{height: "337px", width: '100%', typography: 'body1', padding: '0'}}>
            <PopupPasswords url={url}/>
          </TabPanel>
          <TabPanel value="2" sx={{height: "337px", padding: '0'}}>
            <PasswordGenerator />
          </TabPanel>
          <TabPanel value="3" sx={{height: "337px", padding: '0'}}>
            <MFAKeyForm url={url} />
          </TabPanel>
        </TabContext>
      </Box>
    </div>

  )
}

export default PopupBody;