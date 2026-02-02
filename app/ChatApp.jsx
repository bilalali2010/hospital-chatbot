"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const QUICK_OPTIONS = ["Cardiology", "Pediatrics", "Neurology", "Orthopedics"];

export default function ChatApp() {
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "1";

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello 👋 I’m here to help you. Please choose a department or ask a question.",
      isWelcome: true,
      time: new Date()
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text) {
    if (!text?.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, time: new Date() }
    ]);

    setLoading(true);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.reply, time: new Date() }
    ]);

    setLoading(false);
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>We are online</div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.row,
              justifyContent: m.role === "user" ? "flex-end" : "flex-start"
            }}
          >
            <div
              style={{
                ...styles.bubble,
                ...(m.role === "user"
                  ? styles.userBubble
                  : styles.botBubble)
              }}
            >
              <div style={styles.text}>{m.content}</div>

              {m.isWelcome && (
                <div style={styles.quickWrap}>
                  {QUICK_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      style={styles.quickBtn}
                      onClick={() => sendMessage(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              <div style={styles.time}>
                {m.time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={styles.row}>
            <div style={{ ...styles.bubble, ...styles.botBubble }}>
              <span style={styles.typing}>Typing…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputBar}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your message…"
          style={styles.input}
        />
        <button onClick={() => sendMessage(input)} style={styles.send}>
          Send
        </button>
      </div>

      {/* Footer */}
      <div style={styles.footer}>Powered by Bilal AI Studio</div>

      {isAdmin && (
        <div style={styles.adminNote}>
          Admin Mode — data from <code>hospital.json</code>
        </div>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    height: "100vh",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  },

  header: {
    padding: "14px",
    background: "#0d6efd",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    textAlign: "center"
  },

  messages: {
    flex: 1,
    padding: "14px 12px",
    overflowY: "auto"
  },

  row: {
    display: "flex",
    marginBottom: 12
  },

  bubble: {
    maxWidth: "78%",
    padding: "12px 14px",
    borderRadius: 18,
    fontSize: 15,
    lineHeight: 1.55,
    transition: "none" // prevent jumping
  },

  botBubble: {
    background: "#f1f5ff",
    color: "#1f2937"
  },

  userBubble: {
    background: "#0d6efd",
    color: "#ffffff"
  },

  text: {
    letterSpacing: 0.1,
    fontWeight: 400
  },

  time: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 6,
    textAlign: "right"
  },

  quickWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10
  },

  quickBtn: {
    padding: "7px 14px",
    borderRadius: 999,
    border: "1px solid #0d6efd",
    background: "#ffffff",
    color: "#0d6efd",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    touchAction: "manipulation"
  },

  typing: {
    fontSize: 14,
    opacity: 0.6
  },

  inputBar: {
    display: "flex",
    padding: 10,
    borderTop: "1px solid #e5e7eb",
    background: "#ffffff"
  },

  input: {
    flex: 1,
    padding: "10px 12px",
    fontSize: 15,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    outline: "none"
  },

  send: {
    marginLeft: 8,
    padding: "0 18px",
    borderRadius: 10,
    border: "none",
    background: "#0d6efd",
    color: "#fff",
    fontSize: 14,
    fontWeight: 500
  },

  footer: {
    textAlign: "center",
    fontSize: 11,
    padding: 6,
    opacity: 0.45
  },

  adminNote: {
    textAlign: "center",
    fontSize: 11,
    paddingBottom: 6
  }
};
