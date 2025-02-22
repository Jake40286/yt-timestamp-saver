document.addEventListener("DOMContentLoaded", function() {
    const allTimestampsList = document.getElementById("allTimestampsList");
    const saveChangesButton = document.getElementById("saveChanges");
    const clearAllButton = document.getElementById("clearAllTimestamps");

    let timestampsData = {};
    let commentsData = {};
    let pendingDeletions = new Set(); // Store video IDs marked for deletion
    let pendingComments = {}; // Temporary comment storage before saving

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
        const data = await browser.storage.local.get(["ytTimestamps", "ytComments"]);

        timestampsData = data.ytTimestamps || {};
        commentsData = data.ytComments || {};

        if (Object.keys(timestampsData).length > 0) {
            for (const videoId of Object.keys(timestampsData)) {
                const videoTitle = await getVideoTitle(videoId);

                const videoSection = document.createElement("div");
                videoSection.className = "video-section";
                videoSection.dataset.videoId = videoId;

                const titleElement = document.createElement("h3");
                titleElement.textContent = videoTitle;
                videoSection.appendChild(titleElement);

                timestampsData[videoId].forEach((timestampObj, index) => {
                    const timeFormatted = formatTime(timestampObj.time || 0);

                    const entry = document.createElement("div");
                    entry.className = "entry";

                    // ✅ Clickable Timestamp Link
                    const link = document.createElement("a");
                    link.href = `https://www.youtube.com/watch?v=${videoId}&t=${timestampObj.time}s`;
                    link.textContent = `[${timeFormatted} Clickable Link]`;
                    link.target = "_blank";

                    // ✅ Comment Display Below
                    const commentText = document.createElement("p");
                    commentText.className = "comment-text";
                    commentText.textContent = commentsData[videoId]?.[index] || "No comment.";
                    commentText.style.marginTop = "5px";
                    commentText.style.fontStyle = "italic";
                    commentText.style.color = "#555";

                    // ✅ Comment Input Field (Hidden Initially)
                    const commentInput = document.createElement("input");
                    commentInput.type = "text";
                    commentInput.placeholder = "Edit comment...";
                    commentInput.value = commentsData[videoId]?.[index] || "";
                    commentInput.style.marginLeft = "10px";
                    commentInput.style.display = "none"; // Hidden by default

                    // ✅ Toggle Input on Click
                    commentText.addEventListener("click", function () {
                        commentText.style.display = "none";
                        commentInput.style.display = "inline-block";
                        commentInput.focus();
                    });

                    // Store comments temporarily before saving
                    commentInput.addEventListener("input", function() {
                        if (!pendingComments[videoId]) {
                            pendingComments[videoId] = [];
                        }
                        pendingComments[videoId][index] = commentInput.value;
                    });

                    // ✅ Hide Input on Blur and Show Updated Comment
                    commentInput.addEventListener("blur", function () {
                        commentText.textContent = commentInput.value || "No comment.";
                        commentText.style.display = "block";
                        commentInput.style.display = "none";
                    });

                    // ✅ Delete Button (Marks for Deletion Instead of Removing)
                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "❌ Mark for Deletion";
                    deleteButton.style.marginLeft = "10px";
                    deleteButton.addEventListener("click", function () {
                        toggleDelete(videoSection);
                    });

                    entry.appendChild(link);
                    entry.appendChild(commentText);
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

    function toggleDelete(videoSection) {
        const videoId = videoSection.dataset.videoId;
        
        if (pendingDeletions.has(videoId)) {
            pendingDeletions.delete(videoId);
            videoSection.classList.remove("marked-for-deletion");
        } else {
            pendingDeletions.add(videoId);
            videoSection.classList.add("marked-for-deletion");
        }
    }

    function saveChanges() {
        if (pendingDeletions.size > 0) {
            for (const videoId of pendingDeletions) {
                delete timestampsData[videoId];
                delete commentsData[videoId];
            }
            pendingDeletions.clear();
        }

        // Merge temporary comments into saved comments
        for (const videoId in pendingComments) {
            if (!commentsData[videoId]) {
                commentsData[videoId] = [];
            }
            pendingComments[videoId].forEach((comment, index) => {
                commentsData[videoId][index] = comment;
            });
        }

        browser.storage.local.set({ ytTimestamps: timestampsData, ytComments: commentsData }).then(() => {
            console.log("✅ Changes saved.");
            loadTimestamps(); // Refresh the list
        }).catch(error => console.error("Error saving changes:", error));
    }

    function clearAllTimestamps() {
        if (confirm("⚠️ Are you sure you want to clear ALL timestamps? This action cannot be undone!")) {
            if (confirm("⚠️ This is your last chance! Click OK to permanently delete all timestamps.")) {
                browser.storage.local.remove(["ytTimestamps", "ytComments"]).then(() => {
                    allTimestampsList.innerHTML = "No timestamps saved.";
                    console.log("✅ All timestamps cleared.");
                }).catch(error => console.error("Error clearing timestamps:", error));
            }
        }
    }

    saveChangesButton.addEventListener("click", saveChanges);
    clearAllButton.addEventListener("click", clearAllTimestamps);

    loadTimestamps();
});
