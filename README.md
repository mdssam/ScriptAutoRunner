# ScriptAutoRunner (Manifest V3 Edition)

A revived, modernized, and feature-rich fork of the original ScriptAutoRunner extension, rebuilt from the ground up to support modern browser standards.

Inject any JavaScript snippet or external script directly into a website. Scripts can be automated, filtered by hostname, and easily controlled.

![](ss/02.png)

---

## The Manifest V3 Upgrade (What's New in this Fork)

The original extension was declared deprecated and abandoned because Manifest V2 was phased out. This fork revives the extension with major modernization and premium additions:

* **Full Manifest V3 (MV3) Compatibility**: Rebuilt with standard-compliant MV3 service worker injection, meeting Google's latest security, performance, and lifecycle specifications.
* **Modernized Storage Layer**: Fully migrated the backend from legacy `window.localStorage` (which is deprecated and unsafe in MV3) to the high-performance `chrome.storage.local` API. Automatic migration handles your existing local scripts safely.
* **Immersive Full-screen Editor Modal**: A beautiful, distraction-free overlay to write your code. Includes:
  * Real-time syntax highlighting using **Prism.js**.
  * Synchronized line-number gutter.
  * Elastic vertical and horizontal scroll synchronization.
* **Editing Lock / Security Switch**: Added a secure lock mode (`isLocked`). Toggle the lock to prevent accidental script edits, deletions, or setting modifications while managing your list.
* **MV3 CSP Resolution**: Fixed the syntax parse error on strict Chrome extension CSP profiles by employing a clean, unminified standard browser build of libraries.

---

## Features

* **Add Library**: Inject external JavaScript libraries by URL (e.g., jQuery, Lodash).
* **Add Snippet**: Write, save, and inject custom JS snippets directly.
* **Auto-Execution**: Injected scripts execute automatically on page load.
* **Targeted Hostname Filtering**: Enable/disable scripts globally or restrict execution to specific domains using simple comma-separated matches.
* **Single-Click Toggle**: Use the interactive "plug" toggle button to temporarily disable or enable any script.
* **Global Extension Switch**: Kill-switch to shut down all scripts immediately.

---

## Installation (Manual Developer Mode)

Because Manifest V3 extensions must be loaded locally when installed from forks:

1. **Download** or clone this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** in the top-left corner.
5. Select the `ScriptAutoRunner` project directory.
6. The extension is now successfully installed and running!

---

## Usage

### Lock System
Click the padlock icon at the top to toggle Lock/Unlock mode. When locked, scripts cannot be edited or deleted, safeguarding your working environment.

### Edit Custom Snippets
Click the **code icon** to create a custom snippet. Under the snippet text, click the **eye/expand icon** to open the immersive full-screen code editor with live syntax highlighting.

![](ss/01.png)

### Target Hostnames
By default, scripts execute on all websites. To restrict scripts to specific domains, write target hostnames (separated by commas) in the domain field:

```
github.io, github.com
```

### Enable/Disable
Click the plug icon to toggle individual scripts on or off.

![](ss/03.png)
