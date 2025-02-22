# YouTube Timestamp Saver

**Early Development Version** – This project is still in its initial stages. Expect changes and improvements.

## Overview
YouTube Timestamp Saver is a **Firefox extension** that allows users to **save specific timestamps** while watching YouTube videos. This helps users keep track of important moments in videos for easy reference later.

## Features
- Save timestamps with a single click while watching YouTube videos.
- Popup UI to quickly access saved timestamps.
- "All Timestamps" page to view, edit, and delete timestamps.
- Persistence – Timestamps are saved and accessible across sessions.
- Delete Timestamps – Users can mark timestamps for deletion before saving changes.

## Installation (Firefox Debugging Mode)
Since this extension is in early development, you need to load it manually in Firefox.

### 1. Enable Debugging Mode
1. Open Firefox and go to:
   ```
   about:debugging#/runtime/this-firefox
   ```
2. Click **"Load Temporary Add-on"**.

### 2. Load the Extension
1. Select the `manifest.json` file inside the project folder.
2. The extension should now appear in your browser.

### 3. Test the Extension
- Open YouTube.
- Click the extension icon to open the popup.
- Save timestamps and test features.

**Note:** Since this is a temporary load, Firefox removes the extension when the browser is closed. To keep using it, repeat the steps above.

## Future Plans
- Improved Save Button Placement in YouTube’s controls.
- Better UI Styling for the popup and timestamps page.
- Tags & Notes for Timestamps.
- Export/Import Feature to backup timestamps.

## Contributing
Since this is in early development, contributions, feedback, and ideas are welcome. Feel free to create issues or submit pull requests.