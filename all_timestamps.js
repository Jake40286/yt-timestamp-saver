document.addEventListener("DOMContentLoaded", function() {
    const allTimestampsList = document.getElementById("allTimestampsList");
    const clearAllButton = document.getElementById("clearAllTimestamps");

    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return h > 0 
            ? `${h}h${m}m${s}s` 
            : m > 0 
                ? `${m}m${s}s` 
                : `${s}s`;
    }

    async function getVideoTitle(videoId) {
        try {
            const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
            const data = await response.json();
            return data.title || `Video ID: ${videoId}`;
        } catch (error) {
            console.error("Error fetching video title:", error);
            return `Video ID: ${videoId}`;
        }
    }

    async function loadTimestamps() {
        allTimestampsList.innerHTML = "";
        const data = await browser.storage.local.get("ytTimestamps");
        const commentsData = await browser.storage.local.get("ytComments");

        if (data.ytTimestamps && Object.keys(data.ytTimestamps).length > 0) {
            for (const videoId of Object.keys(data.ytTimestamps)) {
                const videoTitle = await getVideoTitle(videoId);

                const videoSection = document.createElement("div");
                videoSection.className = "video-section";

                const titleElement = document.createElement("h3");
                titleElement.textContent = videoTitle;
                videoSection.appendChild(titleElement);

                data.ytTimestamps[videoId].forEach((timestampObj, index) => {
                    const timeFormatted = formatTime(timestampObj.time || 0);

                    const entry = document.createElement("div");
                    entry.className = "entry";

                    // ✅ Clickable Timestamp Link
                    const link = document.createElement("a");
                    link.href = `https://www.youtube.com/watch?v=${videoId}&t=${timestampObj.time}s`;
                    link.textContent = `[${timeFormatted} Clickable Link]`;
                    link.target = "_blank";

                    // ✅ Comment Input Field
                    const commentInput = document.createElement("input");
                    commentInput.type = "text";
                    commentInput.placeholder = "Add a comment...";
                    commentInput.value = commentsData.ytComments?.[videoId]?.[index] || "";
                    commentInput.style.marginLeft = "10px";

                    // Save comment when typing
                    commentInput.addEventListener("input", function() {
                        saveComment(videoId, index, commentInput.value);
                    });

                    // ✅ Delete Button
                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "❌ Remove";
                    deleteButton.style.marginLeft = "10px";
                    deleteButton.addEventListener("click", function () {
                        removeTimestamp(videoId, index);
                    });

                    entry.appendChild(link);
                    entry.appendChild(commentInput);
                    entry.appendChild(deleteButton);
                    videoSection.appendChild(entry);
                });

                allTimestampsList.appendChild(videoSection);
            }
        } else {
            allTimestampsList.textContent = "No timestamps saved.";
        }
    }

    function saveComment(videoId, index, comment) {
        browser.storage.local.get("ytComments").then(data => {
            const comments = data.ytComments || {};

            if (!comments[videoId]) {
                comments[videoId] = [];
            }
            comments[videoId][index] = comment;

            browser.storage.local.set({ ytComments: comments });
        }).catch(error => console.error("Error saving comment:", error));
    }

    function removeTimestamp(videoId, index) {
        browser.storage.local.get(["ytTimestamps", "ytComments"]).then(data => {
            let timestamps = data.ytTimestamps || {};
            let comments = data.ytComments || {};

            if (!timestamps[videoId]) return;

            timestamps[videoId].splice(index, 1);
            if (comments[videoId]) {
                comments[videoId].splice(index, 1);
            }

            if (timestamps[videoId].length === 0) {
                delete timestamps[videoId];
                delete comments[videoId];
            }

            browser.storage.local.set({ ytTimestamps: timestamps, ytComments: comments }).then(() => {
                console.log(`✅ Removed timestamp at index ${index} for video ${videoId}`);
                location.reload();
            });
        }).catch(error => console.error("Error removing timestamp:", error));
    }

    clearAllButton.addEventListener("click", function() {
        browser.storage.local.remove(["ytTimestamps", "ytComments"]).then(() => {
            allTimestampsList.innerHTML = "No timestamps saved.";
        }).catch(error => console.error("Error clearing timestamps:", error));
    });

    loadTimestamps();
});
