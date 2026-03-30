import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@pazaryonetimi/database";

// AI Image Generation endpoint
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prompt, style } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // In a real implementation, this would call DALL-E, Midjourney, or Stable Diffusion
    // For now, we'll return a mock response with placeholder image URL
    
    const styles: Record<string, string> = {
      "Gerçekçi": "photorealistic",
      "3D": "3d-render",
      "Çizim": "illustration",
      "Minimal": "minimalist",
      "Suluboya": "watercolor",
      "Dijital Sanat": "digital-art",
    };

    // Generate a deterministic seed based on prompt
    const seed = prompt.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Mock image URL - in production, this would be the actual generated image
    // Using placeholder service for demo
    const width = 1024;
    const height = 768;
    const mockImageUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;

    // Log the generation
    await prisma.aIGenerationLog.create({
      data: {
        type: "blog_image",
        prompt: `${style}: ${prompt}`,
        result: mockImageUrl,
        model: "dall-e-3-mock",
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      imageUrl: mockImageUrl,
      prompt: prompt,
      style: style,
      seed: seed,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
