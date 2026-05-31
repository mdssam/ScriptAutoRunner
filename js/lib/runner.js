(function() {
  const currentScript = document.currentScript;
  const url = new URL(currentScript.src);
  const extensionId = url.searchParams.get("ext");
  const scriptId = url.searchParams.get("id");
  const timestamp = url.searchParams.get("ts");

  window.addEventListener("message", (ev) => {
    const msg = ev.data;
    if (msg?.from === "sar-extension" && msg?.extension === extensionId && msg?.timestamp === timestamp && msg?.scriptId === scriptId) {
      if (msg?.action === "run") {
        try {
          (0, eval)(msg.code);
        } catch (err) {
          // Self-healing: if it's a DOM/null/reference error, retry after 250ms
          if (err instanceof TypeError || err instanceof ReferenceError) {
            console.warn("ScriptAutoRunner: Script failed due to DOM/null/Reference error, retrying in 250ms...", err);
            setTimeout(() => {
              try {
                (0, eval)(msg.code);
              } catch (retryErr) {
                console.error("ScriptAutoRunner execution error (after retry):", retryErr);
              }
            }, 250);
          } else {
            console.error("ScriptAutoRunner execution error:", err);
          }
        }
      }
    }
  });

  // Notify content script that runner is ready
  window.postMessage({
    from: "sar-runner",
    extension: extensionId,
    scriptId: scriptId,
    timestamp: timestamp,
    action: "ready"
  }, "*");
})();
