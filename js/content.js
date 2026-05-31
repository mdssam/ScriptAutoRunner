chrome.storage.local.get(['SAR'], (result) => {
  var data = result['SAR'] || {
    power: true,
    scripts: [],
    options: {
      exclude: ''
    }
  };

  function runScript(script) {
    const extensionId = chrome.runtime.id;
    const baseUrl = "chrome-extension://" + extensionId;
    const timestamp = new Date().getTime().toString();
    const scriptId = script.id.toString();

    // Listen for the runner's ready message
    const messageHandler = (ev) => {
      const msg = ev.data;
      if (msg?.from === "sar-runner" && msg?.extension === extensionId && msg?.scriptId === scriptId && msg?.timestamp === timestamp) {
        if (msg?.action === "ready") {
          // Send the code to execute
          window.postMessage({
            from: "sar-extension",
            extension: extensionId,
            scriptId: scriptId,
            timestamp: timestamp,
            action: "run",
            code: script.type === 'snippet' ? script.code : `
              (function() {
                var tag = document.createElement('script');
                tag.src = ${JSON.stringify(script.src)};
                document.body.appendChild(tag);
              })();
            `
          }, "*");
          window.removeEventListener("message", messageHandler);
        }
      }
    };
    window.addEventListener("message", messageHandler);

    // Inject the runner script
    const support = document.head || document.documentElement;
    const tag = document.createElement('script');
    const runnerUrl = baseUrl + "/js/lib/runner.js?ext=" + extensionId + "&id=" + scriptId + "&ts=" + timestamp;
    tag.setAttribute("src", runnerUrl);
    tag.onload = () => {
      tag.remove();
    };
    support.appendChild(tag);
  }

  function isMatch(host) {
    if (host === '' || host === 'any') {
      return true;
    }
    
    var hostname = window.location.hostname;
    var hosts, match;
    if (host.indexOf(',') !== -1) {
      hosts = host.split(',');
      match = hosts.some((_host) => {
        return hostname.indexOf(_host.trim()) !== -1;
      });
    }
    else {
      match = hostname.indexOf(host) !== -1;
    }
    return match;
  }
  
  function isExcludeHost(host) {
    if (host === '') {
      return false;
    }
    
    var hostname = window.location.hostname;
    var hosts, match;
    if (host.indexOf(',') !== -1) {
      hosts = host.split(',');
      match = hosts.some((_host) => {
        return hostname.indexOf(_host.trim()) !== -1;
      });
      
    }
    else {
      match = hostname.indexOf(host) !== -1;
    }
    
    return match;
  }
  
  if (data.options && data.options.exclude) {
    if (isExcludeHost(data.options.exclude)) {
      return false;
    }
  }
  
  if (data.power) {
    data.scripts.forEach((script) => {
      if (script.enable) {
        if(isMatch(script.host)) {
          runScript(script);
        }
      }
    });
  }  
});
