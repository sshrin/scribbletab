// Background service worker for Web Annotator
chrome.runtime.onInstalled.addListener(() => {
    console.log('Web Annotator extension installed');
  });
  
  // Handle extension icon click
  chrome.action.onClicked.addListener(async (tab) => {
    try {
      // Inject content script if not already present
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: toggleAnnotationMode
      });
    } catch (error) {
      console.error('Failed to inject script:', error);
    }
  });
  
  // Function to be injected into the page
  function toggleAnnotationMode() {
    if (window.webAnnotator) {
      window.webAnnotator.toggle();
    } else {
      // Initialize if not already done
      if (document.getElementById('web-annotator-overlay')) {
        document.getElementById('web-annotator-overlay').style.display = 
          document.getElementById('web-annotator-overlay').style.display === 'none' ? 'block' : 'none';
      }
    }
  }
  
  // Message handling for communication between popup and content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleAnnotations') {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: toggleAnnotationMode
        });
      });
    }
  });