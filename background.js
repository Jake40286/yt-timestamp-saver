chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveTimestamp") {
        chrome.storage.local.get({ ytTimestamps: {} }, (result) => {
            const timestamps = result.ytTimestamps;

            if (!timestamps[request.data.videoId]) {
                timestamps[request.data.videoId] = [];
            }

            timestamps[request.data.videoId].push({
                title: request.data.title,
                time: request.data.time,
                url: request.data.url
            });

            chrome.storage.local.set({ ytTimestamps: timestamps });
            console.log("Saved to storage:", request.data);
        });
    }
});
