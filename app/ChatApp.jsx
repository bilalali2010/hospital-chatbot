"use client";
import { useEffect, useRef, useState } from "react";

const QUICK_REPLIES = [
  "What services do you provide?",
  "What are your working hours?",
  "Do you accept insurance?",
];

export default function ChatApp() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [businessData, setBusinessData] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "1") {
      const pwd = prompt("Enter admin password:");
      if (pwd === "@supersecret") setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;

    setMessages((p) => [...p, { role: "user", content: msg }]);
    setInput("");
    setIsTyping(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });

    const data = await res.json();
    setIsTyping(false);

    setMessages((p) => [...p, { role: "assistant", content: data.reply }]);
  };

  const saveBusinessData = async () => {
    const res = await fetch("/api/admin/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessData,
        password: "@supersecret",
      }),
    });
    alert(res.ok ? "Information saved globally!" : "Save failed");
  };

  return (
    <div style={styles.container}>
      <div style={styles.chat}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.bubble,
              ...(m.role === "user" ? styles.user : styles.bot),
              animation: "fadeSlide 0.3s ease",
            }}
          >
            {m.content}
          </div>
        ))}

        {isTyping && <div style={styles.typing}>•••</div>}

        {/* Quick replies */}
        <div style={styles.quickWrap}>
          {QUICK_REPLIES.map((q) => (
            <button key={q} style={styles.quickBtn} onClick={() => sendMessage(q)}>
              {q}
            </button>
          ))}
        </div>

        <div ref={chatEndRef} />
      </div>

      <div style={styles.inputBar}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          style={styles.input}
        />
        <button onClick={() => sendMessage()} style={styles.send}>
          ➤
        </button>
      </div>

      {isAdmin && (
        <div style={styles.admin}>
          <textarea
            value={businessData}
            onChange={(e) => setBusinessData(e.target.value)}
            placeholder="Paste hospital info here"
            style={styles.textarea}
          />
          <button onClick={saveBusinessData} style={styles.save}>
            Save Information
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 420,
    margin: "0 auto",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f4f6fb",
  },
  chat: { flex: 1, overflowY: "auto", padding: 12 },
  bubble: {
    padding: "10px 14px",
    borderRadius: 18,
    marginBottom: 8,
    maxWidth: "80%",
  },
  user: { background: "#2b4c7e", color: "#fff", marginLeft: "auto" },
  bot: { background: "#e6ebf5", color: "#000" },
  typing: {
    background: "#e6ebf5",
    padding: "8px 14px",
    borderRadius: 18,
    width: 50,
  },
  inputBar: {
    display: "flex",
    padding: 10,
    background: "#fff",
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    border: "1px solid #ccc",
  },
  send: {
    marginLeft: 8,
    padding: "0 14px",
    borderRadius: "50%",
  },
  quickWrap: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 6,
  },
  quickBtn: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 14,
    border: "1px solid #ccc",
    background: "#fff",
  },
  admin: { padding: 10, background: "#fff" },
  textarea: { width: "100%", height: 120 },
  save: { width: "100%", marginTop: 6 },
};
