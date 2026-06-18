export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateBlogImage } from "@/lib/ai/blog-assistant";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prompt, style } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const { imageUrl, model } = await generateBlogImage(prompt, style || "Gerçekçi");

    await prisma.aIGenerationLog.create({
      data: {
        type: "blog_image",
        prompt: `${style}: ${prompt}`,
        result: imageUrl,
        model,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      imageUrl,
      prompt,
      style,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 },
    );
  }
}
