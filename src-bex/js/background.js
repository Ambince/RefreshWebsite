// Background code goes here
console.log('Amence background start',chrome.tabs)

chrome.browserAction.onClicked.addListener((tab) => {
    // Opens our extension in a new browser window.
    // Only if a popup isn't defined in the manifest.
    console.log('Amence background.js')

    chrome.tabs.create({url: chrome.extension.getURL('www/index.html')}, (newTab) => {
        // Tab opened.
        console.log('Amence chrome.browserAction.onClicked.addListener',newTab)
    })
})



window.onload = function() {
    chrome.runtime.onMessage.addListener(function (msg,sender,sendResponse){
        console.log('Amence onMessage', msg["tabId"])
    })
}

