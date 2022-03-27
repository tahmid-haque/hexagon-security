import parser from '../utils/parser'

let validUrls = ['amazon.ca', 'facebook.com', 'twitter.com', 'yelp.ca', 'utoronto.ca', 'instagram.com', 'grademy.work'];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.clear() 
  chrome.storage.local.set({'url': 'window.location.href', 'username': null, 'password': null, 'autofillClosed': false});
})

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + parser.extractDomain(sender.tab.url) :
                "from the extension");
    if (request.message === "isValidSite"){
      sendResponse({valid: validUrls.includes(parser.extractDomain(sender.tab.url))});
    }
      
    if (request.message === "sameDomain"){
      // console.log("previous " + request.previous);
      // console.log("current " + request.current);
      sendResponse({sameSite: (parser.extractDomain(request.previous) === parser.extractDomain(request.current))});
    }
  }
);