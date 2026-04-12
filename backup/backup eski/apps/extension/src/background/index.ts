console.log("Background script initialized");

// This will handle communication between content scripts and our main API
chrome.runtime.onMessage.addListener((request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    console.log("Message received in background:", request);

    if (request.type === "SCRAPE_PRODUCT") {
        // Forward to our main API
        // In a real scenario, we'd use fetch() to post this to our NestJS backend
        console.log("Forwarding product data to API:", request.data);

        // Simulating API call
        setTimeout(() => {
            sendResponse({ success: true, message: "Product data synced" });
        }, 500);

        return true; // Keep channel open for async response
    }

    if (request.type === "GET_PRODUCT_HISTORY") {
        sendResponse({ success: true, history: [] });
    }

    return true;
});
