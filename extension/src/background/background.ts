import parser from '../utils/parser'

let validUrls = ['amazon.ca', 'facebook.com', 'twitter.com', 'yelp.ca', 'utoronto.ca', 'instagram.com'];

chrome.runtime.onInstalled.addListener(() => {
  // TODO: on installed function
})

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + parser.extractDomain(sender.tab.url) :
                "from the extension");
    if (request.message === "isValidSite")
      sendResponse({valid: validUrls.includes(parser.extractDomain(sender.tab.url))});
  }
);
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log(sender);
//   console.log(request);
//   console.log(request.message === "new page");
//   if (request.message === "new page"){
//       sendResponse({name: "raisa", url: request.changeInfo.url});
//   }
// })

