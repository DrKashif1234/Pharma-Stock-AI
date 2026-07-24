import { callGemini } from './_gemini';

// Runs as a Vercel Node.js serverless function at POST /api/chat.
// The Gemini key is read from process.env server-side only — it is never
// sent to, or reachable from, the browser bundle.

const SYSTEM_INSTRUCTION = `You are PharmaStock AI Assistant, an inventory management assistant embedded in a pharmacy inventory app.
Analyze ONLY the inventory data provided to you below in the "INVENTORY DATA" section of the user message.
Never invent medicine names, quantities, expiry dates, batch numbers, or stock levels that are not present in that data.
If the user asks about something not present in the provided data, respond exactly:
"I could not find this information in the current inventory data."
Focus only on pharmacy inventory management, stock levels, expiry monitoring, and organization.
Keep answers concise, structured, and practical for a pharmacist or pharmacy staff member. Use short bullet points when listing multiple medicines.`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const { message, history, inventoryContext } = req.body ?? {};

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Missing "message" string in request body.' });
      return;
    }

    const historyText = Array.isArray(history)
      ? history
          .slice(-8)
          .map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
          .join('\n')
      : '';

    const prompt = `INVENTORY DATA (JSON):
${inventoryContext ?? '[]'}

CONVERSATION SO FAR:
${historyText}

User question: ${message}`;

    const result = await callGemini(SYSTEM_INSTRUCTION, prompt);

    if (!result.ok) {
      res.status(result.status ?? 502).json({ error: result.error });
      return;
    }

    res.status(200).json({ reply: result.text, modelUsed: result.modelUsed });
  } catch (err: any) {
    res.status(500).json({ error: `Unexpected server error: ${err?.message ?? String(err)}` });
  }
}
