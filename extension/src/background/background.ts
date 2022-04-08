import { credentialsAPI } from "../utils/credentialsAPI";
import { authenticationAPI } from "../utils/authenticationAPI";

//clear and set storage when chrome extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.clear();
    chrome.storage.local.set({
        url: "google.com",
        username: null,
        password: null,
        autofillClosed: false,
    });
});

//listen to messages being sent from the content script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    //content script asking if a site contains any credentials for autofill
    if (request.message === "isValidSite") {
        (async () => {
            chrome.storage.local.get(["hexagonAccount"], function (result) {
                if (!result.hexagonAccount) sendResponse({ valid: false });
                else {
                    credentialsAPI
                        .getWebsiteCredentials(
                            {
                                email: result.hexagonAccount.email,
                                masterKey: result.hexagonAccount.key,
                                jwt: result.hexagonAccount.token,
                            },
                            sender.tab.url
                        )
                        .then((credentials) => {
                            !credentials || credentials.length == 0
                                ? sendResponse({ valid: false })
                                : sendResponse({
                                      valid: true,
                                      credentials: credentials,
                                  });
                        });
                }
            });
        })();
        return true;
    }

    //content script asking credential already exists when trying to save password
    if (request.message === "credentialAlreadyExists") {
        (async () => {
            chrome.storage.local.get(["hexagonAccount"], function (result) {
                if (!result.hexagonAccount) sendResponse({ valid: false });
                else if (sender.url.includes("hexagon-web.xyz"))
                    sendResponse({ valid: false });
                else {
                    credentialsAPI
                        .checkCredentialExists(
                            {
                                email: result.hexagonAccount.email,
                                masterKey: result.hexagonAccount.key,
                                jwt: result.hexagonAccount.token,
                            },
                            request.url,
                            request.username
                        )
                        .then((exists) => {
                            exists
                                ? sendResponse({
                                      valid: false,
                                  })
                                : sendResponse({ valid: true });
                        });
                }
            });
        })();
        return true;
    }

    //content script asking to create a credential
    if (request.message === "createCredential") {
        (async () => {
            chrome.storage.local.get(["hexagonAccount"], function (result) {
                //if user is logged in, check if the credential exists first, if yes then update, else create
                if (result.hexagonAccount) {
                    credentialsAPI
                        .checkCredentialExists(
                            {
                                email: result.hexagonAccount.email,
                                masterKey: result.hexagonAccount.key,
                                jwt: result.hexagonAccount.token,
                            },
                            request.url,
                            request.username
                        )
                        .then(async (exists) => {
                            if (exists) {
                                await credentialsAPI.updateCredential(
                                    {
                                        email: result.hexagonAccount.email,
                                        masterKey: result.hexagonAccount.key,
                                        jwt: result.hexagonAccount.token,
                                    },
                                    exists.id,
                                    request.url,
                                    request.username,
                                    request.password,
                                    exists.key
                                );
                            } else {
                                await credentialsAPI.createCredential(
                                    {
                                        email: result.hexagonAccount.email,
                                        masterKey: result.hexagonAccount.key,
                                        jwt: result.hexagonAccount.token,
                                    },
                                    request.url,
                                    request.username,
                                    request.password
                                );
                            }
                        });
                }
            });
        })();
        return true;
    }
});

//listens to messages from external scripts
chrome.runtime.onMessageExternal.addListener(function (
    request,
    sender,
    sendResponse
) {
    //hexagon website asking to signin to extension
    if (request.sentFrom === "Hexagon") {
        chrome.storage.local.get(["hexagonAccount"], function (result) {
            //checks if user is not logged in or is already logged in to the requested account
            if (
                !result.hexagonAccount ||
                (result.hexagonAccount &&
                    result.hexagonAccount.email != request.user.username)
            ) {
                chrome.tabs.sendMessage(
                    sender.tab.id,
                    { message: "signin", email: request.user.username },
                    async function (response) {
                        //if logged in to a different account signout first then log in
                        if (response.message === "accept") {
                            try {
                                if (result.hexagonAccount) {
                                    await authenticationAPI.signOut(
                                        result.hexagonAccount.token
                                    );
                                }

                                await authenticationAPI.signIn(
                                    request.user.username,
                                    request.user.password
                                );
                            } catch {
                                chrome.storage.local.clear();
                            }
                        }
                    }
                );
            }
        });
    }
});
