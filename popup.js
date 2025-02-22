document.addEventListener("DOMContentLoaded", () => {
    const listContainer = document.getElementById("timestampList");
    const clearButton = document.getElementById("clearTimestamps");
    const viewAllButton = document.getElementById("viewAllTimestamps");

    function getCurrentVideoId(callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs.length) return;
            const url = new URL(tabs[0].url);
            const videoId = url.searchParams.get("v");
            callback(videoId);
        });
    }

    function loadTimestamps() {
        listContainer.innerHTML = "";

        chrome.storage.local.get({ ytTimestamps: {} }, (result) => {
            const allTimestamps = result.ytTimestamps;

            getCurrentVideoId((videoId) => {
                if (!videoId) {
                    listContainer.innerHTML = "<p>No video detected.</p>";
                    return;
                }

                const timestamps = allTimestamps[videoId] || [];

                if (!timestamps.length) {
                    listContainer.innerHTML = "<p>No timestamps saved for this video.</p>";
                    return;
                }

                timestamps.forEach((entry, index) => {
                    const div = document.createElement("div");
                    div.className = "entry";
                    div.innerHTML = `
                        <a href="${entry.url}" target="_blank">${entry.title} - ${entry.time}s</a>
                        <button data-video="${videoId}" data-index="${index}" class="delete">❌</button>
                    `;
                    listContainer.appendChild(div);
                });

                document.querySelectorAll(".delete").forEach(btn => {
                    btn.addEventListener("click", (e) => {
                        const videoId = e.target.getAttribute("data-video");
                        const index = e.target.getAttribute("data-index");
                        allTimestamps[videoId].splice(index, 1);
                        if (!allTimestamps[videoId].length) {
                            delete allTimestamps[videoId];
                        }
                        chrome.storage.local.set({ ytTimestamps: allTimestamps }, loadTimestamps);
                    });
                });
            });
        });
    }

    clearButton.addEventListener("click", () => {
        getCurrentVideoId((videoId) => {
            if (!videoId) return;
            chrome.storage.local.get({ ytTimestamps: {} }, (result) => {
                const allTimestamps = result.ytTimestamps;
                delete allTimestamps[videoId];
                chrome.storage.local.set({ ytTimestamps: allTimestamps }, loadTimestamps);
            });
        });
    });

    viewAllButton.addEventListener("click", () => {
        chrome.tabs.create({ url: chrome.runtime.getURL("all_timestamps.html") });
    });

    loadTimestamps();
});
