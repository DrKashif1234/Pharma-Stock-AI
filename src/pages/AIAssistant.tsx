import { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, Loader2, AlertCircle } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ChatMessage } from '../types';
import { generateId, getExpiryStatus, getStockStatus, nowIso } from '../utils/inventoryLogic';

const SUGGESTED_QUESTIONS = [
  'Which medicines are expiring soon?',
  'Which medicines have low stock?',
  'Give me a summary of my inventory.',
  'What are my most urgent inventory problems?',
];

export default function AIAssistant() {
  const { medicines, settings } = useInventory();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId('msg'),
      role: 'assistant',
      content:
        "Hi, I'm the PharmaStock AI Assistant. Ask me about expiring medicines, low stock, or a summary of your current inventory.",
      timestamp: nowIso(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  function buildInventoryContext(): string {
    const summary = medicines.map((m) => ({
      name: m.name,
      genericName: m.genericName,
      category: m.category,
      quantity: m.quantity,
      minStockLevel: m.minStockLevel,
      stockStatus: getStockStatus(m),
      expiryDate: m.expiryDate,
      expiryStatus: getExpiryStatus(m.expiryDate, settings.expiringSoonWindowDays),
      batchNumber: m.batchNumber,
    }));
    return JSON.stringify(summary);
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { id: generateId('msg'), role: 'user', content: trimmed, timestamp: nowIso() };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history,
          inventoryContext: buildInventoryContext(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? 'The AI assistant is unavailable right now.');
      }

      setMessages((prev) => [
        ...prev,
        { id: generateId('msg'), role: 'assistant', content: data.reply, timestamp: nowIso() },
      ]);
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong contacting the AI assistant.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-display font-semibold text-ink-900">PharmaStock AI Assistant</h1>
          <p className="text-xs text-ink-500">Answers based only on your current inventory data</p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto thin-scroll flex flex-col gap-3 py-3 px-1"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
              m.role === 'user'
                ? 'self-end bg-brand-500 text-white rounded-br-sm'
                : 'self-start bg-white border border-base-border text-ink-900 rounded-bl-sm shadow-card'
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="self-start flex items-center gap-2 text-sm text-ink-500 px-4 py-2.5">
            <Loader2 size={16} className="animate-spin" /> Thinking…
          </div>
        )}
        {error && (
          <div className="self-start flex items-start gap-2 text-sm text-status-danger bg-red-50 rounded-xl px-4 py-2.5 max-w-[85%]">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="px-3 py-1.5 rounded-full bg-white border border-base-border text-xs text-ink-700 hover:bg-brand-50 focus-ring"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="flex items-center gap-2 bg-white border border-base-border rounded-xl shadow-card p-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your inventory…"
          className="flex-1 px-3 py-2 text-sm focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-9 h-9 rounded-lg bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 disabled:opacity-40 focus-ring"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
