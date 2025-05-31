document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("proxyToggle");
  const timerDisplay = document.getElementById("timer");
  const connectionStatus = document.getElementById("connectionStatus");
  let timerInterval;

  // Update timer function
  function updateTimer(startTime) {
    if (!startTime) return;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
      const seconds = String(elapsed % 60).padStart(2, "0");

      timerDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    }, 1000);
  }

  // Get initial status
  chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
    if (response.enabled) {
      button.textContent = "Отключить";
      connectionStatus.textContent = "Подключено";
      connectionStatus.className = "connected";
      updateTimer(response.startTime);
    } else {
      timerDisplay.textContent = "00:00:00";
      button.textContent = "Включить";
      connectionStatus.textContent = "Отключено";
      connectionStatus.className = "disconnected";
    }
  });

  // Button click handler
  button.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "toggleProxy" }, (response) => {
      if (response.status === "enabled") {
        button.textContent = "Отключить";
        connectionStatus.textContent = "Подключено";
        connectionStatus.className = "connected";
        chrome.storage.local.get("startTime", (data) => {
          updateTimer(data.startTime);
        });
      } else {
        button.textContent = "Включить";
        connectionStatus.textContent = "Отключено";
        connectionStatus.className = "disconnected";
        timerDisplay.textContent = "00:00:00";
        clearInterval(timerInterval);
      }
    });
  });
});