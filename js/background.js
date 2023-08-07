let loggedIn = false;
let tabUrl = '';
let password = '';
let tabId = 0;
let currentUpload = 0;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    (tab.url) ? tabUrl = tab.url : console.log('No url found');
});

// Listen for the browser window to be closed
chrome.windows.onRemoved.addListener(windowId => {
    // Set loggedIn to false when the browser window is closed
    setLoggedIn(false);
});

// Function to set loggedIn status in local storage
function setLoggedIn(loggedInValue) {
    loggedIn = loggedInValue;
    chrome.storage.local.set({loggedIn: loggedInValue});
}

// Function to set password in local storage
function setPassword(passwordValue) {
    password = passwordValue;
    chrome.storage.local.set({password: passwordValue});
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        if (tabs[0] && tabs[0].url && tabs[0].id) {
            tabUrl = tabs[0].url;
            tabId = tabs[0].id;
        } else {
            console.log('No url found');
        }
    });
    const websiteTopLevel = tabUrl.split('/')[2];

    if (request.type === "check") {
        console.log("Checking if logged in", loggedIn);
        sendResponse(loggedIn);
    } else if (request.type === "register") {
        console.log("Registering");
        chrome.storage.sync.get([request.password], function (result) {
            let existingData = JSON.parse(result[request.password] || '{}');

            if (Object.keys(existingData).length === 0) {
                existingData = {};
            }

            chrome.storage.sync.set({[request.password]: JSON.stringify(existingData)}, function () {
                console.log("Registered");
                setLoggedIn(true);
                setPassword(request.password);
                sendResponse(loggedIn);
            });
        });
    } else if (request.type === "login") {
        console.log("Logging in");
        chrome.storage.sync.get([request.password], function (result) {
            loggedIn = (result[request.password] !== undefined);
            (loggedIn) ? console.log("Logged in") : console.log("Not logged in");
            console.log(loggedIn);
            setPassword(request.password);
            sendResponse(loggedIn); // Send response synchronously here
        });
    } else if (request.type === "save") {
        if (loggedIn) {
            console.log("Saving");
            chrome.storage.sync.get([password], function (result) {
                let data = JSON.parse(result[password] || '{}');
                const currentWebsiteTopLevel = request.websiteUrl.split('/')[2];

                if (!data[currentWebsiteTopLevel]) {
                    data[currentWebsiteTopLevel] = [];
                }

                const existingEntry = data[currentWebsiteTopLevel].find(
                    entry => entry.username === request.username && entry.password === request.password
                );

                if (!existingEntry) {
                    data[currentWebsiteTopLevel].push({username: request.username, password: request.password});
                }

                console.log(data);

                chrome.storage.sync.set({[password]: JSON.stringify(data)}, function () {
                    console.log("Saved");
                    sendResponse("Saved");
                });
            });
        } else {
            console.log("Not logged in");
            sendResponse("Not logged in");
        }
    } else if (request.type === "get") {
        console.log("Getting");
        console.log("tabUrl: ", tabUrl)
        chrome.storage.sync.get([password], function (result) {
            console.log("Url: ", tabUrl);
            console.log("Data: ", result[password]);
            sendResponse([result[password], websiteTopLevel]);
        });
    } else if (request.type === "logout") {
        console.log("Logging out");
        loggedIn = false;
        password = '';
        sendResponse("Logged out");
    } else if (request.type === 'delete') {
        console.log("Deleting");
        chrome.storage.sync.get([password], function (result) {
            console.log("Url: ", tabUrl);
            console.log("Data: ", result[password]);
            console.log("Request: ", request)
            let data = JSON.parse(result[password]);
            data[websiteTopLevel] = data[websiteTopLevel].filter(password => !(password.username === request.password.username && password.password === request.password.password));
            console.log(data);
            chrome.storage.sync.set({[password]: JSON.stringify(data)}, function () {
                console.log("Deleted");
                sendResponse("Deleted");
            });
        });
    } else if (request.type === 'upload') {
        console.log("Uploading");
        currentUpload = request.password;
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ['js/upload.js']
        }).then(() => {
            console.log("Executed");
        }).catch(err => {
            console.log(err);
        })
    } else if (request.type === 'uploadData') {
        console.log("Uploading data");
        sendResponse(currentUpload);
    }

    return true;
});
