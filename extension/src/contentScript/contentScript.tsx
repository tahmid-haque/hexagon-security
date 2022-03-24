import React, { useState, useEffect, HTMLAttributes } from 'react'
import ReactDOM from 'react-dom'
import { Card, Box, Button, Typography, Tab } from '@mui/material';
import Header from '../sharedComponents/header/header'
import './contentScript.css'

const AutofillOverlay = ({autofill} : {autofill: () => void}) => {
    const closeOverlay = () => ReactDOM.render(<div></div>, root);

    return (
        <div className='overlay'>
            <Header url={chrome.runtime.getURL("icon.png")} clickAction ={closeOverlay} />
            <Card className='overlay-body'>
                <div>Username/Password fields detected. Autofill fields?</div>
                <Button size='large' sx={{margin: "5px", fontSize: "15px"}} onClick={autofill}>Autofill</Button>
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
// ReactDOM.render(<SavePassOverlay />, root);


const findUsernameField = () => {
    let usernameSelectors: string[] = ["username", "email", "user"];
    for(let elmt of document.querySelectorAll("input")){
        if(elmt.clientWidth == 0 || elmt.clientHeight == 0) continue;
        for(let attr of elmt.attributes){
            for(let selector of usernameSelectors){
                if (attr.nodeValue.toLowerCase().includes(selector)) return elmt;
            }
        }
    }
    return null;
}

const findPasswordField = () => {
    for(let pass of document.querySelectorAll("[type='password']")){
        if(pass.clientWidth == 0 || pass.clientHeight == 0) continue;
        return pass;
    }
    return null;
}

window.addEventListener('load', function(){
    console.log("hello from content script");

    MutationObserver = window.MutationObserver;

    let observer = new MutationObserver(function(mutations, observer) {
        let usernameField = findUsernameField();
        let passwordField = findPasswordField() as HTMLInputElement;

        console.log("1");
        console.log( usernameField);
        console.log( passwordField);
        if(usernameField){
            usernameField.addEventListener("click", () => "click username");
            console.log("hello");
            usernameField.onclick = function(){
                console.log("username field clicked");
                ReactDOM.render(<AutofillOverlay autofill={ () => {
                    usernameField.value = "tt@tt.t";
                    usernameField.setAttribute("value", "tt@tt.t");
                    if(passwordField){
                        passwordField.value = "password123";
                        passwordField.setAttribute("value", "password");
                    }
                    ReactDOM.render(<div></div>, root);
                }}/>, root);
            }
        }
        if(passwordField){
            passwordField.onclick = function(){
                console.log("password field clicked");
                ReactDOM.render(<AutofillOverlay autofill={ () => {
                    passwordField.value = "password123";
                    passwordField.setAttribute("value", "password");

                    console.log(usernameField);

                    if(usernameField){
                        usernameField.value = "tt@tt.t";
                        // usernameField.setAttribute("value", "tt@tt.t");
                    }
                    ReactDOM.render(<div></div>, root);
                }}/>, root);
            }
        }
    });

    observer.observe(document, {
        subtree: true,
        childList: true,
        attributes: true
    });

    // window.onclick = function(c) {
    //     console.log("clicked document");
    //     document.querySelectorAll("input").forEach(function(e){
    //         e.onclick = function(t){
    //             console.log("form field clicked");
    //             ReactDOM.render(<AutofillOverlay autofill={ () => {
    //                 let pass: HTMLInputElement = e;
    //                 pass.click()
    //                 pass.value = "john@gmail.com";
    //                 pass.setAttribute("value", "john@gmail.com");
    //                 ReactDOM.render(<div></div>, root);
    //             }}/>, root);
    //         } 
    //     });
    // };
});
// chrome.tabs.onUpdated.addListener(function
//     (tabId, changeInfo, tab) {
//       // read changeInfo data and do something with it (like read the url)
//         if(changeInfo.url) {
//           console.log(changeInfo.url);
//           console.log(tabId);
//           chrome.tabs.sendMessage(tabId, {message: "new page", changeInfo}, function(response){
//             console.log(response);
//           });
//         }
     
//     }
//   );
