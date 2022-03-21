import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Card, Box, Button, Typography, Tab } from '@mui/material';
import Header from '../sharedComponents/header/header'
import './contentScript.css'

const AutofillOverlay = () => {
    return (
        <div className='overlay'>
            <Header url={chrome.runtime.getURL("icon.png")} clickAction ={() => console.log("close overlay")} />
            <Card className='overlay-body'>
                <div>Username/Password fields detected. Autofill fields?</div>
                <Button size='large' sx={{margin: "5px", fontSize: "15px"}}>Autofill</Button>
            </Card>
        </div>
    )
}

const SavePassOverlay = () => {
    return (
        <div className='overlay'>
            <Header url={chrome.runtime.getURL("icon.png")} clickAction ={() => console.log("close overlay")} />
            <Card className='overlay-body'>
                <div>Username/Password detected. Save username and password?</div>
                <Button size='large' sx={{margin: "5px", fontSize: "15px"}}>Save</Button>
            </Card>
        </div>
    )
}

const root = document.createElement('div')
document.body.appendChild(root)
// ReactDOM.render(<AutofillOverlay />, root);
ReactDOM.render(<SavePassOverlay />, root);


const detectUsernameField = () => {
    
}

const detectPasswordField = () => {

}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    console.log(request);
    if (request.message === "new page"){
        sendResponse({name: "raisa", url: request.changeInfo.url});
    }
})
