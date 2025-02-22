(function() {
    console.log("YouTube Timestamp Saver: Content script loaded");

    function addButton() {
        if (document.getElementById("saveTimestampButton")) return;

        const container = document.querySelector(".ytp-right-controls");
        if (!container) return;

        console.log("Adding Save Timestamp button...");

        const button = document.createElement("button");
        button.innerText = "Save Timestamp";
        button.id = "saveTimestampButton";
        button.style.cssText = "margin-left: 10px; padding: 5px; background:rgba(255, 0, 0, 0); color: white; border: none; cursor: pointer;";
        
        button.addEventListener("click", () => {
            const video = document.querySelector("video");
            if (!video) return;

            const timestamp = Math.floor(video.currentTime);
            const videoTitle = document.title.replace(" - YouTube", "");
            const videoUrl = window.location.href.split("&")[0] + "&t=" + timestamp + "s";
            const videoId = new URL(videoUrl).searchParams.get("v");

            console.log(`Attempting to save: ${videoTitle} at ${timestamp}s (Video ID: ${videoId})`);

            chrome.runtime.sendMessage({ 
                action: "saveTimestamp", 
                data: { videoId, title: videoTitle, time: timestamp, url: videoUrl } 
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError);
                } else {
                    console.log("Background response:", response);
                }
            });
        });

        container.appendChild(button);
    }

    setInterval(addButton, 2000);
})();
