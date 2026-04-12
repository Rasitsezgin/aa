import { handlers } from "@/auth"
import type { NextRequest } from "next/server"

// Wrap handlers with proper Next.js 16 route handler signatures
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ nextauth: string[] }> }
) {
    return handlers.GET(request as any)
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ nextauth: string[] }> }
) {
    return handlers.POST(request as any)
}
