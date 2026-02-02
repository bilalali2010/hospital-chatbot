"use client";
import { useState, useEffect } from "react";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    setMessages([
      { role: "bot", text: "Hello! How can I help you today?" }
    ]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input })
    });

    const data = await res.json();
    setTyping(false);

    setMessages(prev => [...prev, { role: "bot", text: data.reply }]);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                m.role === "user"
                  ? "bg-blue-600 text-white ml-auto"
                  : "bg-gray-200 text-black"
              }`}
            >
              {m.text}
            </div>
          ))}

          {typing && (
            <div className="bg-gray-200 px-4 py-2 rounded-2xl w-fit animate-pulse">
              Typing...
            </div>
          )}
        </div>

        <div className="p-3 border-t flex gap-2">
          <input
            className="flex-1 border rounded-full px-4 py-2 outline-none"
            placeholder="Ask something..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 rounded-full"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
