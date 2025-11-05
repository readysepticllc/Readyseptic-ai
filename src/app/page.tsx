"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages([...messages, userMsg]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userMsg.content }),
    });
    const data = await res.json();
    setMessages((m) => [...m, { role: "assistant", content: data.answer }]);
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">🟢 LIVE Assistant</h1>
      <div className="w-full max-w-xl space-y-3">
        <div className="border rounded p-3 h-96 overflow-y-auto bg-gray-50">
          {messages.map((m, i) => (
            <p key={i} className={m.role === "user" ? "text-blue-700" : "text-gray-800"}>
              <strong>{m.role}:</strong> {m.content}
            </p>
          ))}
          {loading && <p className="italic text-gray-500">Thinking…</p>}
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask me anything…"
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
