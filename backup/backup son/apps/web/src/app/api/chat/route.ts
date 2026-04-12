import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: openai('gpt-4-turbo'),
        system: `You are an expert SaaS Onboarding Assistant for "Pazaryonetimi". 
    Your goal is to help a new e-commerce merchant set up their store.
    
    Ask them:
    1. What kind of products they sell.
    2. Which marketplaces they sell on (Trendyol, Hepsiburada, etc).
    3. Their company scale (Solo, Small Team, Enterprise).

    After 3 turns, suggest a configuration in JSON format inside a markdown block.
    Example:
    \`\`\`json
    {
       "suggestedModules": ["SEO", "StockManagement"],
       "marketplaces": ["Trendyol"],
       "theme": "modern-dark"
    }
    \`\`\`
    `,
        messages,
    });

    return result.toTextStreamResponse();
}
