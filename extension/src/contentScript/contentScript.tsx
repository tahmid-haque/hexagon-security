import ReactDOM from "react-dom";
import {
    AutofillOverlay,
    SavePassOverlay,
    SigninOverlay,
} from "./Overlay/Overlay";
import parser from "hexagon-shared/utils/parser";

//properties of a credential
export type Credential = {
    id: string;
    username: string;
    password: string;
    url: string;
    key: string;
};

/**
 * Given an element, set its value to value parameter
 * @param element
 * @param value
 */
function setNativeValue(element, value) {
    // set value of a field, taken from https://github.com/facebook/react/issues/10135
    const { set: valueSetter } =
        Object.getOwnPropertyDescriptor(element, "value") || {};
    const prototype = Object.getPrototypeOf(element);
    const { set: prototypeValueSetter } =
        Object.getOwnPropertyDescriptor(prototype, "value") || {};

    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
    } else if (valueSetter) {
        valueSetter.call(element, value);
    } else {
        throw new Error("The given element does not have a value setter");
    }
}

/**
 * Returns a function that takes in a username and password value and
 * sets username and password fields to the corresponding value.
 * @param props
 * @returns a function that autofills username and password
 */
const autofill =
    (props: OverlayProps) => (username: string, password: string) => {
        if (props.usernameField) {
            setNativeValue(props.usernameField, username);
            props.usernameField.dispatchEvent(
                new Event("input", { bubbles: true })
            );
        }
        if (props.passwordField) {
            setNativeValue(props.passwordField, password);
            props.passwordField.dispatchEvent(
                new Event("input", { bubbles: true })
            );
        }
        closeOverlay();
    };

/**
 * Returns a function that takes in a username, password, and url value and
 * sends a message to the background script to create the credential.
 * @param props
 * @returns a function that saves username and password
 */
const saveCredentials =
    (props: OverlayProps) =>
    (username: string, password: string, url: string) => {
        chrome.runtime.sendMessage({
            message: "createCredential",
            username: username,
            password: password,
            url: url,
        });
        closeOverlay();
    };

/**
 * Renders when overlay is closed
 */
const closeOverlay = () => {
    ReactDOM.render(<App />, root);
};

//root element for the content script's UI
const root = document.createElement("div");
root.id = "hexagon-extension-root";
document.body.appendChild(root);

//properties for the overlays to be rendered on a webpage
type OverlayProps = {
    usernameField?: HTMLInputElement;
    passwordField?: HTMLInputElement;
    username?: string;
    password?: string;
    isAutofillOpen?: boolean;
    isSaveOpen?: boolean;
    isSigninOpen?: boolean;
    hexagonEmail?: string;
    onDeclineSignin?: () => void;
    onAcceptSignin?: () => void;
    credentials?: Credential[];
    saveURL?: string;
};

/**
 * Content script UI component for the overlays that get displayed on webpages
 * @param props
 * @returns a react component
 */
const App = (props: OverlayProps) => {
    return (
        <div>
            {(props.isSaveOpen ?? false) && (
                <SavePassOverlay
                    username={props.username ?? ""}
                    password={props.password ?? ""}
                    closeOverlay={() => closeOverlay()}
                    saveCredentials={saveCredentials(props)}
                    saveURL={props.saveURL}
                />
            )}
            {(props.isAutofillOpen ?? false) && (
                <AutofillOverlay
                    autofill={autofill(props)}
                    closeOverlay={() => {
                        chrome.storage.local.set({ autofillClosed: true });
                        closeOverlay();
                    }}
                    accounts={props.credentials!}
                />
            )}
            {(props.isSigninOpen ?? false) && (
                <SigninOverlay
                    email={props.hexagonEmail}
                    closeOverlay={closeOverlay}
                    onAccept={props.onAcceptSignin}
                    onDecline={props.onDeclineSignin}
                />
            )}
        </div>
    );
};

/**
 * Searches the current webpage for a username field and returns it
 * @returns an element
 */
const findUsernameField = () => {
    let usernameSelectors: string[] = ["username", "email", "user"];
    for (let elmt of document.querySelectorAll("input")) {
        if (elmt.clientWidth == 0 || elmt.clientHeight == 0) continue;
        if (document.querySelector("#hexagon-extension-root").contains(elmt))
            continue;
        for (let attr of elmt.attributes) {
            for (let selector of usernameSelectors) {
                if (attr.nodeValue.toLowerCase().includes(selector))
                    return elmt;
            }
        }
    }
    return null;
};

/**
 * Searches the current webpage for a password field and returns it
 * @returns an element
 */
const findPasswordField = () => {
    for (let pass of document.querySelectorAll("[type='password']")) {
        if (pass.clientWidth == 0 || pass.clientHeight == 0) continue;
        if (document.querySelector("#hexagon-extension-root").contains(pass))
            continue;
        return pass;
    }
    return null;
};

/**
 * Asks background script if credentials exist for websit. If yes, render the autofill overlay
 * with the credentials the user can login with.
 */
function fillFormFields(
    usernameField: HTMLInputElement,
    passField: HTMLInputElement
) {
    chrome.runtime.sendMessage({ message: "isValidSite" }, function (response) {
        chrome.storage.local.get(["autofillClosed"], function (result) {
            if (!result.autofillClosed && response.valid) {
                ReactDOM.render(
                    <App
                        usernameField={usernameField}
                        passwordField={passField}
                        credentials={response.credentials}
                        isAutofillOpen={true}
                    />,
                    root
                );
            }
        });
    });
}

/**
 * Clear the passwords in chrome storage so only one possible credential is stored at a time
 */
function clearStorage() {
    chrome.storage.local.get(
        ["url", "hexagonAccount", "autofillClosed"],
        function (result) {
            chrome.storage.local.clear();
            chrome.storage.local.set({
                url: result.url,
                hexagonAccount: result.hexagonAccount,
                autofillClosed: result.autofillClosed,
            });
        }
    );
}

/**
 * Asks the background script if a crednetial already exists. If no, display the save credentials
 * overlay form with the username and password.
 * @param username
 * @param password
 * @param url
 */
async function displaySave(username: string, password: string, url: string) {
    chrome.runtime.sendMessage(
        { message: "credentialAlreadyExists", username: username, url: url },
        function (response) {
            clearStorage();
            if (response.valid) {
                ReactDOM.render(
                    <App
                        username={username}
                        password={password}
                        isSaveOpen={true}
                        saveURL={url}
                    />,
                    root
                );
            }
        }
    );
}

/**
 * Check chrome storage to see if if both a username and password field have been read.
 * If yes, it's likely a signin/signup page and the save overlay should be displayed.
 * Checks when the content script has not been reloaded, useful for SPAs.
 */
function displaySavePassSamePage() {
    chrome.storage.local.get(
        ["url", "username", "password"],
        async function (result) {
            try {
                let current = parser.extractDomain(window.location.href);
                let prev = parser.extractDomain(result.url);
                if (result.url != window.location.href && result.password) {
                    if (current === prev) {
                        if (result.username)
                            await displaySave(
                                result.username,
                                result.password,
                                current
                            );
                        clearStorage();
                    }
                }
                chrome.storage.local.set({ url: window.location.href });
            } catch {
                chrome.storage.local.set({ url: window.location.href });
            }
        }
    );
}

/**
 * Check chrome storage to see if if both a username and password field have been read.
 * If yes, it's likely a signin/signup page and the save overlay should be displayed.
 * Checks when the content script has been reloaded from the start.
 */
function displaySavePassDiffPage() {
    chrome.storage.local.get(
        ["url", "username", "password"],
        async function (result) {
            try {
                let current = parser.extractDomain(window.location.href);
                let prev = parser.extractDomain(result.url);
                if (current === prev && result.password) {
                    if (result.username)
                        await displaySave(
                            result.username,
                            result.password,
                            current
                        );
                    clearStorage();
                }
                if (current !== prev) clearStorage();

                chrome.storage.local.set({ url: window.location.href });
            } catch {
                chrome.storage.local.set({ url: window.location.href });
            }
        }
    );
}

/**
 * Sets event handlers for field1 which could be a username or password field.
 * If it's clicked then the autofill overlay may potentially need to be displayed
 * if a credential exists. Keeps track of input changes to the field as well.
 * @param field1 username or password field
 * @param field2 username or password field
 * @param key the type of field1, 'username' or 'password'
 */
function setEventHandlers(
    field1: HTMLInputElement,
    field2: HTMLInputElement,
    key: string
) {
    field1.onclick = function () {
        if (key === "username") fillFormFields(field1, field2);
        else fillFormFields(field2, field1);
    };
    chrome.storage.local.set({ [key]: field1.value });

    field1.addEventListener("input", function (e) {
        chrome.storage.local.set({ [key]: field1.value });
    });
}

//wait for webpage to load
window.addEventListener("load", function () {
    //listen for messages from the background script
    chrome.runtime.onMessage.addListener(function (
        request,
        sender,
        sendResponse
    ) {
        //display signin overlay when background script asks to signin to a Hexagon account
        if (request.message === "signin") {
            (async () => {
                ReactDOM.render(
                    <App
                        isSigninOpen={true}
                        hexagonEmail={request.email}
                        onAcceptSignin={() => {
                            sendResponse({ message: "accept" });
                            closeOverlay();
                        }}
                        onDeclineSignin={() => {
                            sendResponse({ message: "decline" });
                            closeOverlay();
                        }}
                    />,
                    root
                );
            })();
            return true;
        }
    });

    //check to see if save overlay needs to be displayed
    displaySavePassDiffPage();
    //determines whether autofill overlay should be displayed again on the same page
    chrome.storage.local.set({ autofillClosed: false });

    //watches for mutations on the current page
    MutationObserver = window.MutationObserver;

    let observer = new MutationObserver(function (mutations, observer) {
        //find username and password fields
        let usernameField = findUsernameField();
        let passwordField = findPasswordField() as HTMLInputElement;

        //check to see if save overlay needs to be displayed
        displaySavePassSamePage();

        //set even handlers for username and password fields if they exist
        if (usernameField) {
            setEventHandlers(usernameField, passwordField, "username");
        }
        if (passwordField) {
            setEventHandlers(passwordField, usernameField, "password");
        }
        //if a login form is submitted, render an empty div in case a different overlap has not yet been closed
        if (usernameField && passwordField) {
            let loginForm = document.querySelector("form") as HTMLFormElement;
            if (loginForm) {
                loginForm.onsubmit = function (e) {
                    ReactDOM.render(<App />, root);
                };
            }
        }
    });

    //changes for the MutationObserver to watch for
    observer.observe(document, {
        subtree: true,
        childList: true,
        attributes: true,
    });
});
