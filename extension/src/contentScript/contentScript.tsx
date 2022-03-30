import React, { useState, useEffect, HTMLAttributes, HtmlHTMLAttributes } from 'react'
import ReactDOM from 'react-dom'
import { AutofillOverlay, SavePassOverlay } from './overlay'

const closeOverlay = () => {
    chrome.storage.local.set({'autofillClosed': true});
    ReactDOM.render(<div></div>, root);
}

const root = document.createElement('div');
root.id = "hexagon-extension-root";
document.body.appendChild(root);
// ReactDOM.render(<AutofillOverlay />, root);
// ReactDOM.render(<SavePassOverlay />, root);


const findUsernameField = () => {
    let usernameSelectors: string[] = ["username", "email", "user"];
    for(let elmt of document.querySelectorAll("input")){
        if(elmt.clientWidth == 0 || elmt.clientHeight == 0) continue;
        if(document.querySelector("#hexagon-extension-root").contains(elmt)) continue;
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
        if(document.querySelector("#hexagon-extension-root").contains(pass)) continue;
        return pass;
    }
    return null;
}

// set value of a field, taken from https://github.com/facebook/react/issues/10135
function setNativeValue(element, value) {
    const { set: valueSetter } = Object.getOwnPropertyDescriptor(element, 'value') || {}
    const prototype = Object.getPrototypeOf(element)
    const { set: prototypeValueSetter } = Object.getOwnPropertyDescriptor(prototype, 'value') || {}

    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value)
    } else if (valueSetter) {
      valueSetter.call(element, value)
    } else {
      throw new Error('The given element does not have a value setter')
    }
}

function fillFormFields(usernameField: HTMLInputElement , passField: HTMLInputElement){
    chrome.runtime.sendMessage({message: "isValidSite"}, function(response) {
        console.log(response.valid);

        chrome.storage.local.get(['autofillClosed'], function(result) {
            if(!result.autofillClosed && response.valid){
                ReactDOM.render(<AutofillOverlay autofill={ (username:string, password:string) => {
                    if(usernameField){
                        setNativeValue(usernameField, username);
                        usernameField.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    if(passField){
                        setNativeValue(passField, password);
                        passField.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    ReactDOM.render(<div></div>, root);
                }} 
                closeOverlay={closeOverlay}/>, root);
            }
        });
    }); 
}

function displaySavePass(){
    chrome.storage.local.get(['url', 'username', 'password'], function(result) {
        if(result.url != window.location.href && result.username && result.password){
            chrome.runtime.sendMessage({message: "sameDomain", previous: result.url, current: window.location.href}, function(response) {
                if(response.sameSite){
                    console.log('prev url ' + result.url);
                    console.log('username ' + result.username);
                    console.log('password ' + result.password);
                    ReactDOM.render(<SavePassOverlay username={result.username} password={result.password} closeOverlay={closeOverlay}/>, root);
                }
            });
        }
    });

    chrome.storage.local.set({'url': window.location.href, 'username': null, 'password': null});
}

function setEventHandlers(field1: HTMLInputElement, field2: HTMLInputElement, key:string){
    field1.onclick = function(){
        console.log("username field clicked");
        fillFormFields(field1, field2);  
    }
    chrome.storage.local.set({[key]: field1.value});

    field1.addEventListener('input', function(e){
        chrome.storage.local.set({[key]: field1.value});
    });
}

window.addEventListener('load', function(){
    console.log("hello from content script");

    // ReactDOM.render(<SavePassOverlay username={"dsf"} password={"sdf"} closeOverlay={closeOverlay}/>, root);
    // ReactDOM.render(<AutofillOverlay autofill={() => console.log("abc")} closeOverlay={closeOverlay} />, root);

    displaySavePass();
    chrome.storage.local.set({'autofillClosed': false});

    MutationObserver = window.MutationObserver;

    let observer = new MutationObserver(function(mutations, observer) {
        let usernameField = findUsernameField();
        let passwordField = findPasswordField() as HTMLInputElement;

        displaySavePass();

        if(usernameField){
            setEventHandlers(usernameField, passwordField, 'username');
        }
        if(passwordField){
            setEventHandlers(passwordField, usernameField, 'password');
        }
    });

    observer.observe(document, {
        subtree: true,
        childList: true,
        attributes: true
    });

});
