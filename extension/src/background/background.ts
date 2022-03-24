chrome.runtime.onInstalled.addListener(() => {
  // TODO: on installed function
})

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log(sender);
//   console.log(request);
//   console.log(request.message === "new page");
//   if (request.message === "new page"){
//       sendResponse({name: "raisa", url: request.changeInfo.url});
//   }
// })

