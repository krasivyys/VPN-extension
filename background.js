const PROXY_SERVER = {
  name: "Stockholm",
  host: "0.0.0.0",
  port: 19154
};

function enableProxy() {
  const proxyConfig = {
    mode: "fixed_servers",
    rules: {
      singleProxy: {
        scheme: "http",
        host: PROXY_SERVER.host,
        port: PROXY_SERVER.port
      },
      bypassList: ["<local>"]
    }
  };

  chrome.proxy.settings.set({ value: proxyConfig, scope: "regular" }, () => {
    if (chrome.runtime.lastError) {
      console.error("Proxy error:", chrome.runtime.lastError);
    } else {
      chrome.storage.local.set({ 
        proxyEnabled: true,
        startTime: Date.now(),
        serverName: PROXY_SERVER.name
      });
    }
  });
}

function disableProxy() {
  chrome.proxy.settings.clear({}, () => {
    chrome.storage.local.set({ proxyEnabled: false });
    chrome.storage.local.remove("startTime");
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleProxy") {
    chrome.storage.local.get("proxyEnabled", (data) => {
      if (data.proxyEnabled) {
        disableProxy();
        sendResponse({ status: "disabled" });
      } else {
        enableProxy();
        sendResponse({ 
          status: "enabled",
          serverName: PROXY_SERVER.name
        });
      }
    });
    return true;
  }

  if (message.action === "getStatus") {
    chrome.storage.local.get(["proxyEnabled", "startTime", "serverName"], (data) => {
      sendResponse({
        enabled: data.proxyEnabled || false,
        startTime: data.startTime || null,
        serverName: data.serverName || PROXY_SERVER.name
      });
    });
    return true;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ serverName: PROXY_SERVER.name });
});