document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('toggleBtn');
    const clearBtn = document.getElementById('clearBtn');
    const status = document.getElementById('status');
  
    // Check current annotation status
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getStatus' }, (response) => {
        if (response && response.active) {
          updateStatus(true);
        }
      });
    });
  
    toggleBtn.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle' }, (response) => {
          if (response) {
            updateStatus(response.active);
            // Close the popup after a short delay
            setTimeout(() => {
              window.close();
            }, 100);
          }
        });
      });
    });
  
    clearBtn.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'clear' }, () => {
          // Close the popup after clearing
          setTimeout(() => {
            window.close();
          }, 100);
        });
      });
    });
  
    function updateStatus(isActive) {
      if (isActive) {
        status.textContent = 'Annotations: Active';
        status.className = 'status active';
        toggleBtn.textContent = 'Stop Annotating';
      } else {
        status.textContent = 'Annotations: Inactive';
        status.className = 'status inactive';
        toggleBtn.textContent = 'Start Annotating';
      }
    }
  });