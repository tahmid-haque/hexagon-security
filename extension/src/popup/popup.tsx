import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Card, Box, Button, Typography, Tab } from '@mui/material';
import {  TabContext, TabList, TabPanel } from '@mui/lab';
import './popup.css'
import './signin.css'
import PopupPasswords from './passwords/passwords'
import Header from '../sharedComponents/header/header'
import PasswordGenerator from './passwordGenerator';
import parser from '../utils/parser'

const SigninPage = () => {
  const onClickSignin = () => {
    console.log("signin to app")
  }

  return (
    <div className='signin-page'>
      <div className='signin-dialog'>
        <div className='signin-message'>You are not logged in</div>
        <Button variant="outlined" color="inherit" size='large' onClick={onClickSignin}>Sign In</Button>
      </div>
    </div>
  )
}

type User = {
  name: string
}

const GreetUser = ({ name }: User) => {
  return (
    <div className='container'>
      <Box mb={"2px"}>
        <Card>
          <div className='greeting'>Hello {name}...</div>
        </Card>
      </Box>
    </div>
  )
}

const PopupHome = ({ name, url }: {name:string, url:string}) => {
  const [value, setValue] = React.useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (

    <div className='home-container'>
      <GreetUser name={name} />

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
          <TabPanel value="3" sx={{height: "337px", padding: '0'}}>Item Three</TabPanel>
        </TabContext>
      </Box>
    </div>

  )
}

const PopupBody = ({ name, url }: {name:string, url:string}) => {
  if(!name){
    return <SigninPage />
  }
  return <PopupHome name={name} url={url}/>
}

const App = ({url} : {url:string}) => {
  return (
    <div>
      <Header url={"icon.png"} clickAction ={ () => window.close() } />
      {/* <PopupBody name={null} /> */}
      <PopupBody name={"Raisa"} url={url}/>
    </div>
  )
}

const root = document.createElement('div')
document.body.appendChild(root)

{chrome.tabs.query({currentWindow: true, active: true}, function(result){
  console.log(result[0].url);
  try{
    let currentURL = parser.extractDomain(result[0].url);
    ReactDOM.render(<App url={currentURL}/>, root)
  } catch{
    let currentURL = "";
    ReactDOM.render(<App url={currentURL}/>, root)
  }
})}
