import React, { useState, useEffect, HTMLAttributes, HtmlHTMLAttributes } from 'react'
import ReactDOM from 'react-dom'
import { AutofillOverlay, SavePassOverlay } from './overlay'
import parser from '../utils/parser'
import { useComponentState } from '../utils/hooks'


type OverlayProps = {
    usernameField?: HTMLInputElement;
    passwordField?: HTMLInputElement;
    username?: string;
    password?: string;
    isAutofillOpen?: boolean;
    isSaveOpen?: boolean;
}

type OverlayState = {
    isAutofillOpen: boolean;
    isSaveOpen: boolean;
}

const initState: OverlayState = {
    isAutofillOpen: true,
    isSaveOpen: true,
}

type OverlayContext = {
    state: OverlayState;
    update: (update: Partial<OverlayState>) => void;
    props: OverlayProps
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

const autofill = (
    update: (update: Partial<OverlayState>) => void,
    props: OverlayProps
) => (username: string, password: string) => {
        if(props.usernameField){
            setNativeValue(props.usernameField, username);
            props.usernameField.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if(props.passwordField){
            setNativeValue(props.passwordField, password);
            props.passwordField.dispatchEvent(new Event('input', { bubbles: true }));
        }
        update({ isAutofillOpen: false });
        closeOverlay();
}

const closeOverlay = () => {
    ReactDOM.render(<App />, root);
}

const root = document.createElement('div');
root.id = "hexagon-extension-root";
document.body.appendChild(root);

const App = (props: OverlayProps) => {
    const { state, update } = useComponentState(initState);
    const context = { state, update, props };

    return (
        <div>
            {(props.isSaveOpen ?? false) && <SavePassOverlay username={props.username ?? ''} password={props.password ?? ''} closeOverlay={() => closeOverlay()}/>}
            {(props.isAutofillOpen ?? false) && <AutofillOverlay autofill={autofill(update, props)} closeOverlay={() => {
                chrome.storage.local.set({'autofillClosed': true});
                closeOverlay();
            }} />}
        </div>
    )
}


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

function fillFormFields(usernameField: HTMLInputElement, passField: HTMLInputElement){
    chrome.runtime.sendMessage({message: "isValidSite"}, function(response) {
        chrome.storage.local.get(['autofillClosed'], function(result) {
            if(!result.autofillClosed && response.valid){
                ReactDOM.render(<App usernameField={usernameField} passwordField={passField} isAutofillOpen={true} />, root);
            }
        });
    }); 
}

function clearStorage(){
    chrome.storage.local.get(['url', 'hexagonAccount', 'autofillClosed'], function(result){
        chrome.storage.local.clear(); 
        chrome.storage.local.set({'url': result.url, 'hexagonAccount': result.hexagonAccount, 'autofillClosed': result.autofillClosed});
    })
}

function displaySavePassSamePage(){
    chrome.storage.local.get(['url', 'username', 'password'], function(result) {
        let current = parser.extractDomain(window.location.href);
        let prev = parser.extractDomain(result.url);
        if(result.url != window.location.href && result.password){
            if(current === prev){
                ReactDOM.render(<App username={result.username} password={result.password} isSaveOpen={true} />, root);
                clearStorage();
            }
        }
        chrome.storage.local.set({'url': window.location.href});
    });
}

function displaySavePassDiffPage(){
    chrome.storage.local.get(['url', 'username', 'password'], function(result) {
        let current = parser.extractDomain(window.location.href);
        let prev = parser.extractDomain(result.url);
        if(current === prev && result.password){
            ReactDOM.render(<App username={result.username} password={result.password} isSaveOpen={true} />, root);
            clearStorage();
        }
        if(current !== prev) clearStorage();

        chrome.storage.local.set({'url': window.location.href});
    });

}

function setEventHandlers(field1: HTMLInputElement, field2: HTMLInputElement, key:string){
    field1.onclick = function(){
        if(key === 'username') fillFormFields(field1, field2); 
        else fillFormFields(field2, field1); 
    }
    chrome.storage.local.set({[key]: field1.value});

    field1.addEventListener('input', function(e){
        chrome.storage.local.set({[key]: field1.value});
    });
}

window.addEventListener('load', function(){
    console.log("hello from content script");

    displaySavePassDiffPage();
    chrome.storage.local.set({'autofillClosed': false});

    MutationObserver = window.MutationObserver;

    let observer = new MutationObserver(function(mutations, observer) {
        let usernameField = findUsernameField();
        let passwordField = findPasswordField() as HTMLInputElement;

        displaySavePassSamePage();

        if(usernameField){
            setEventHandlers(usernameField, passwordField, 'username');
        }
        if(passwordField){
            setEventHandlers(passwordField, usernameField, 'password');
        }
        if(usernameField && passwordField){
            let loginForm = document.querySelector("form") as HTMLFormElement;
            if (loginForm){
                loginForm.onsubmit = function(e){
                    ReactDOM.render(<App />, root);
                }
            }
            
        }
    });

    observer.observe(document, {
        subtree: true,
        childList: true,
        attributes: true
    });

});
