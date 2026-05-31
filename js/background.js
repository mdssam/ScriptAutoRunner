// Background service worker for ScriptAutoRunner

// Register on extension startup or installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('ScriptAutoRunner extension installed in Manifest V3 mode.');
});
