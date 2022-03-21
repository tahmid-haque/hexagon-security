chrome.runtime.onInstalled.addListener(() => {
  // TODO: on installed function
})

chrome.tabs.onUpdated.addListener(function
  (tabId, changeInfo, tab) {
    // read changeInfo data and do something with it (like read the url)
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if(tabs[0].id === tabId && changeInfo.url) {
        console.log(changeInfo.url);
        chrome.tabs.sendMessage(tabId, {message: "new page", changeInfo}, function(response){
          console.log(response);
        });
      }
    });
   
  }
);


