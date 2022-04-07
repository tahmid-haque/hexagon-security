import parser from "hexagon-shared/utils/parser";
import AccountService from "hexagon-frontend/src/services/AccountService";
import { credentialsAPI } from "../utils/credentialsAPI";
import { authenticationAPI } from "../utils/authenticationAPI";

//api call to save mfa key

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.clear();
    chrome.storage.local.set({
        url: "google.com",
        username: null,
        password: null,
        autofillClosed: false,
    });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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

    if (request.message === "credentialAlreadyExists") {
        console.log(request);
        (async () => {
            chrome.storage.local.get(["hexagonAccount"], function (result) {
                if (!result.hexagonAccount) sendResponse({ valid: false });
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
                            console.log(exists);
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

    if (request.message === "createCredential") {
        console.log(request);
        (async () => {
            chrome.storage.local.get(["hexagonAccount"], function (result) {
                if (result.hexagonAccount) {
                    credentialsAPI.createCredential(
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
        })();
        return true;
    }
});

chrome.runtime.onMessageExternal.addListener(function (
    request,
    sender,
    sendResponse
) {
    if (request.sentFrom === "Hexagon") {
        chrome.storage.local.get(["hexagonAccount"], function (result) {
            if (
                !result.hexagonAccount ||
                (result.hexagonAccount &&
                    result.hexagonAccount.email != request.user.username)
            ) {
                chrome.tabs.sendMessage(
                    sender.tab.id,
                    { message: "signin", email: request.user.username },
                    function (response) {
                        if (response.message === "accept")
                            authenticationAPI.signIn(
                                request.user.username,
                                request.user.password
                            );
                    }
                );
            }
        });
    }
});
