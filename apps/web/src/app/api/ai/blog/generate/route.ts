export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateBlogSuggestions } from "@/lib/ai/blog-assistant";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, title, content, prompt } = await request.json();
    const suggestionType = type || "improve";

    const { suggestions, model } = await generateBlogSuggestions(
      suggestionType,
      title || "",
      content || "",
      prompt,
    );

    await prisma.aIGenerationLog.create({
      data: {
        type: `blog_${suggestionType}`,
        prompt: prompt || title || suggestionType,
        result: JSON.stringify(suggestions),
        model,
        tokensUsed: suggestions.length * 50,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 },
    );
  }
}
