async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/growth-ai/${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json() as Promise<T>;
}

export type QaItem = {
  id: string;
  platform: string;
  question: string;
  aiSuggestion: string;
  autoReplied: boolean;
  waitingApproval: boolean;
  relativeTime: string;
};

export function fetchQaInbox() {
  return request<QaItem[]>('qa/inbox');
}

export function approveQa(ticketId: string, content?: string) {
  return request<{ success: boolean }>(`qa/${ticketId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export function fetchSeoBulk() {
  return request<{ items: Array<{ title: string; sku: string; avgScore: number; platforms: Array<{ platform: string; grade: string; score: number }> }> }>('seo/bulk');
}

export function fetchBuyboxDashboard() {
  return request<{ items: Array<{ title: string; platform: string; ourPrice: number; statusLabel: string; competitorPrice: number | null }> }>('buybox/dashboard');
}

export function fetchReturnPatterns() {
  return request<{ products: Array<{ title: string; returnRatePct: number; topReason: string; aiSuggestion: string; healthy: boolean }> }>('returns/patterns');
}

export function fetchReviewQueue() {
  return request<Array<{ orderNumber: string; status: string; reminderNote: string }>>('reviews/queue');
}

export function fetchBaremSuggestions() {
  return request<{ suggestions: Array<{ title: string; currentPrice: number; suggestedPrice: number; action: string; netSavingPerOrder: number }>; summary: { estimatedMonthlyMissed: number } }>('barem/suggestions');
}

export function fetchDesiDisputes() {
  return request<{ disputes: Array<{ orderNumber: string; status: string; productDesi?: number; carrierDesi?: number; extraCharge?: number }>; monthlyExtraCharge: number }>('desi/disputes');
}

export function scanPackaging(code: string) {
  return request<{ type: string; order?: { orderNumber: string; platform: string; itemCount: number; labelStatus: string } }>('packaging/scan', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export function fetchTransferProducts() {
  return request<Array<{ title: string; sourcePlatform: string; targets: Array<{ platform: string; status: string }> }>>('transfer/products');
}

export function fetchCommissionVerify() {
  return request<{ mismatches: number; recoverableAmount: number }>('commission/verify');
}

export function fetchFxSuggestions() {
  return request<{ rates: { USD: number; EUR: number }; suggestions: Array<{ title: string; currentPrice: number; suggestedPrice: number; action: string }> }>('fx/suggestions');
}
