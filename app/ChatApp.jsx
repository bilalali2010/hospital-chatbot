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
      content: "Hello 👋 How can I help you today?",
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
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, time: new Date() }
    ]);
    setInput("");
    setLoading(true);

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
    <div style={styles.wrapper}>
      <div style={styles.chatBox}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.dot} />
          <span>Hospital AI Assistant</span>
        </div>

        {/* Messages */}
        <div style={styles.messages}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                ...styles.row,
                justifyContent:
                  m.role === "user" ? "flex-end" : "flex-start"
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
                {m.content}

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
              </div>
            </div>
          ))}

          {loading && (
            <div style={styles.row}>
              <div style={{ ...styles.bubble, ...styles.botBubble }}>
                <div style={styles.typingDots}>
                  <span />
                  <span />
                  <span />
                </div>
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
            placeholder="Type your message…"
            style={styles.input}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          />
          <button style={styles.send} onClick={() => sendMessage(input)}>
            ➤
          </button>
        </div>

        {/* Footer */}
        <div style={styles.footer}>Powered by Bilal AI Studio</div>

        {isAdmin && (
          <div style={styles.adminNote}>
            Admin Mode — Knowledge loaded from <b>hospital.json</b>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  wrapper: {
    height: "100vh",
    background: "linear-gradient(180deg,#e8f4ff,#f7fbff)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  chatBox: {
    width: "100%",
    maxWidth: 420,
    height: "100vh",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 40px rgba(0,0,0,0.12)"
  },

  header: {
    padding: 14,
    background: "#0b5ed7",
    color: "#fff",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 8
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#22c55e"
  },

  messages: {
    flex: 1,
    padding: "14px",
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
    fontSize: 14,
    lineHeight: 1.5
  },

  botBubble: {
    background: "#f1f5ff",
    color: "#1f2937"
  },

  userBubble: {
    background: "#0b5ed7",
    color: "#fff"
  },

  quickWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10
  },

  quickBtn: {
    padding: "6px 14px",
    borderRadius: 999,
    border: "1px solid #0b5ed7",
    background: "#fff",
    color: "#0b5ed7",
    fontSize: 13,
    cursor: "pointer"
  },

  typingDots: {
    display: "flex",
    gap: 4
  },

  typingDotsSpan: {},

  inputBar: {
    display: "flex",
    padding: 10,
    borderTop: "1px solid #e5e7eb",
    background: "#fff"
  },

  input: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    outline: "none"
  },

  send: {
    marginLeft: 8,
    padding: "0 14px",
    borderRadius: 10,
    border: "none",
    background: "#0b5ed7",
    color: "#fff",
    fontSize: 16
  },

  footer: {
    textAlign: "center",
    fontSize: 11,
    padding: 6,
    opacity: 0.5
  },

  adminNote: {
    textAlign: "center",
    fontSize: 11,
    paddingBottom: 6
  }
};
