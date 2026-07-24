import { callGemini } from './_gemini';

const SYSTEM_INSTRUCTION = `You are PharmaStock AI, an inventory management assistant. Analyze only the inventory data provided by the application. Never invent medicine names, quantities, expiry dates, or stock levels. If information is unavailable, clearly state that it is unavailable. Focus on pharmacy inventory management and organization.

Produce a structured report using these exact section headings, in this order:
## Inventory Overview
## Urgent Attention
## Expiry Risk
## Stock Risk
## Recommended Actions

Under "Recommended Actions", prefix the section with the label "AI-generated inventory suggestions" and give a short prioritized bullet list.
Use plain text bullets ("- "), no tables, no markdown beyond the "##" headings and "-" bullets. Be concise and factual.`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const { inventoryContext } = req.body ?? {};

    if (!inventoryContext) {
      res.status(400).json({ error: 'Missing "inventoryContext" in request body.' });
      return;
    }

    const prompt = `INVENTORY DATA (JSON):
${inventoryContext}

Generate the full structured inventory report now, based only on this data.`;

    const result = await callGemini(SYSTEM_INSTRUCTION, prompt);

    if (!result.ok) {
      res.status(result.status ?? 502).json({ error: result.error });
      return;
    }

    res.status(200).json({ report: result.text, modelUsed: result.modelUsed });
  } catch (err: any) {
    res.status(500).json({ error: `Unexpected server error: ${err?.message ?? String(err)}` });
  }
}
