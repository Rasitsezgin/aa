console.log("Background script initialized");

const API_BASE = typeof chrome !== 'undefined' && chrome.runtime?.getManifest
    ? (chrome.runtime.getManifest() as any).api_base || "https://api.pazaryonetimi.com"
    : "https://api.pazaryonetimi.com";

// ─── Auth token management ──────────────────────
async function getAuthToken(): Promise<string | null> {
    return new Promise((resolve) => {
        chrome.storage.local.get(["authToken"], (result) => {
            resolve(result.authToken || null);
        });
    });
}

async function setAuthToken(token: string): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.set({ authToken: token }, resolve);
    });
}

// ─── API request helper ─────────────────────────
async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> || {}),
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API request failed: ${endpoint}`, error);
        throw error;
    }
}

// ─── Message handling ───────────────────────────
chrome.runtime.onMessage.addListener(
    (request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
        console.log("Message received in background:", request.type);

        if (request.type === "LOGIN") {
            (async () => {
                try {
                    const result = await apiRequest("/auth/login", {
                        method: "POST",
                        body: JSON.stringify({
                            email: request.data.email,
                            password: request.data.password,
                        }),
                    });
                    await setAuthToken(result.token || result.access_token);
                    sendResponse({ success: true, user: result.user });
                } catch (error: any) {
                    sendResponse({ success: false, error: error.message });
                }
            })();
            return true;
        }

        if (request.type === "LOGOUT") {
            chrome.storage.local.remove(["authToken"], () => {
                sendResponse({ success: true });
            });
            return true;
        }

        if (request.type === "CHECK_AUTH") {
            (async () => {
                const token = await getAuthToken();
                sendResponse({ authenticated: !!token });
            })();
            return true;
        }

        if (request.type === "SCRAPE_PRODUCT") {
            (async () => {
                try {
                    const result = await apiRequest("/products/import", {
                        method: "POST",
                        body: JSON.stringify({
                            ...request.data,
                            source: "extension",
                        }),
                    });
                    sendResponse({ success: true, productId: result.id, message: "Ürün başarıyla aktarıldı!" });
                } catch (error: any) {
                    // Fallback: save locally if API is unavailable
                    const stored = await new Promise<any>((resolve) => {
                        chrome.storage.local.get(["pendingProducts"], (r) => resolve(r.pendingProducts || []));
                    });
                    stored.push({ ...request.data, savedAt: new Date().toISOString() });
                    await new Promise<void>((resolve) => {
                        chrome.storage.local.set({ pendingProducts: stored }, resolve);
                    });
                    sendResponse({
                        success: true,
                        offline: true,
                        message: "Ürün yerel olarak kaydedildi. Bağlantı kurulunca senkronize edilecek.",
                    });
                }
            })();
            return true;
        }

        if (request.type === "GET_PRODUCT_HISTORY") {
            (async () => {
                try {
                    const history = await apiRequest(
                        `/market-intelligence/price-history?url=${encodeURIComponent(request.data.url)}`
                    );
                    sendResponse({ success: true, history: history.data || [] });
                } catch (error: any) {
                    sendResponse({ success: false, history: [], error: error.message });
                }
            })();
            return true;
        }

        if (request.type === "GET_COMPETITOR_PRICES") {
            (async () => {
                try {
                    const prices = await apiRequest(
                        `/market-intelligence/competitor-prices?productName=${encodeURIComponent(request.data.productName)}`
                    );
                    sendResponse({ success: true, prices: prices.data || [] });
                } catch (error: any) {
                    sendResponse({ success: false, prices: [], error: error.message });
                }
            })();
            return true;
        }

        if (request.type === "SYNC_PENDING") {
            (async () => {
                const stored = await new Promise<any>((resolve) => {
                    chrome.storage.local.get(["pendingProducts"], (r) => resolve(r.pendingProducts || []));
                });
                let synced = 0;
                const failed: any[] = [];

                for (const product of stored) {
                    try {
                        await apiRequest("/products/import", {
                            method: "POST",
                            body: JSON.stringify(product),
                        });
                        synced++;
                    } catch {
                        failed.push(product);
                    }
                }

                await new Promise<void>((resolve) => {
                    chrome.storage.local.set({ pendingProducts: failed }, resolve);
                });
                sendResponse({ success: true, synced, remaining: failed.length });
            })();
            return true;
        }

        if (request.type === "GET_DASHBOARD_STATS") {
            (async () => {
                try {
                    const stats = await apiRequest("/analytics/dashboard");
                    sendResponse({ success: true, stats });
                } catch (error: any) {
                    sendResponse({ success: false, error: error.message });
                }
            })();
            return true;
        }

        return true;
    }
);

// ─── Periodic sync of pending products ──────────
chrome.alarms.create("syncPending", { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "syncPending") {
        chrome.runtime.sendMessage({ type: "SYNC_PENDING" });
    }
});

// ─── Badge management ───────────────────────────
chrome.storage.onChanged.addListener((changes) => {
    if (changes.pendingProducts) {
        const count = (changes.pendingProducts.newValue || []).length;
        chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
        chrome.action.setBadgeBackgroundColor({ color: "#f97316" });
    }
});
