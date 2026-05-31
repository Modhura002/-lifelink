import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are LifeLink's AI Medical Assistant — a professional, empathetic emergency healthcare assistant built into the LifeLink emergency response platform used across India.

Your role:
- Provide clear, accurate medical guidance for symptoms and emergencies
- Give first-aid instructions when needed
- Assess severity and recommend appropriate urgency level (1-5 scale)
- Always remind users to call 108 for life-threatening emergencies
- Tailor responses to Indian healthcare context (use Indian hospital names, costs in ₹, Indian health conditions prevalence)

Response format:
- Be concise but thorough — 3-6 sentences for mild issues, more detail for serious ones
- Use bullet points for steps/instructions
- Always end with a severity indicator: **Severity: [1-5] — [Mild/Moderate/Serious/Critical/Emergency]**
- For severity 4-5, always recommend calling 108 immediately
- Use markdown bold for key warnings

Never:
- Provide a definitive diagnosis
- Recommend specific prescription doses without noting "as prescribed by your doctor"
- Dismiss any symptom as unimportant without at least checking severity

You have access to the user's context from LifeLink: they are a registered patient with the emergency response system. They may be asking about their own symptoms or a family member's.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.startsWith('your_')) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Separate history from the latest user message
    const history = messages
      .slice(0, -1)
      .filter((m: { role: string; content: string }) => m.role === 'user' || m.role === 'assistant')
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== 'user') {
      return NextResponse.json({ error: 'No user message provided' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-lite-latest',
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMsg.content);
    const text = result.response.text();

    // Extract severity from response text (look for "Severity: X")
    const severityMatch = text.match(/\*\*Severity:\s*([1-5])/);
    const severity = severityMatch ? parseInt(severityMatch[1]) : 1;

    return NextResponse.json({ message: text, severity });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
  }
}
