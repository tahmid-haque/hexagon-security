import parser from '../../../shared/utils/parser'

let validUrls = ['amazon.ca', 'facebook.com', 'twitter.com', 'yelp.ca', 'utoronto.ca', 'instagram.com', 'grademy.work'];


//api call to login and get token


//api call to get username/passwords for current url


//api call to add account details


//check if account exists already


//api call to update account details


//api call to save mfa key


//api call to delete account details




// from https://stackoverflow.com/questions/18371339/how-to-retrieve-name-from-email-address
function extractName(email: string){
  return email.match(/^.+(?=@)/)[0];
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.clear(); 
  chrome.storage.local.set({'url': 'google.com', 'username': null, 'password': null, 'autofillClosed': false});

})

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    // console.log(sender.tab ?
    //             "from a content script:" + parser.extractDomain(sender.tab.url) :
    //             "from the extension");

    if (request.message === "isValidSite"){
      try{
        sendResponse({valid: validUrls.includes(parser.extractDomain(sender.tab.url))});
      } catch {
        sendResponse({valid: false});
      }
      
    }
  }
);

chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    if (request.sentFrom === "Hexagon"){
      console.log(request.user.username);
      console.log(extractName(request.user.username));
      console.log(request.user.password);
      chrome.storage.local.get(['hexagonAccount'], function(result){
        if(!result.hexagonAccount){
          chrome.storage.local.set({'hexagonAccount':{username: extractName(request.user.username), email: request.user.username, password: request.user.password}});
          sendResponse({loggedIn: true});
        }
        sendResponse({loggedIn: false});
      })
    }
  });
