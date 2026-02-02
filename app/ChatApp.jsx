"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ChatApp() {
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "1";

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi 👋 How can I help you today?",
      time: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(msg = null) {
    const messageToSend = msg || input.trim();
    if (!messageToSend) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: messageToSend, time: new Date() }
    ]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: messageToSend })
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.reply, time: new Date() }
    ]);
    setLoading(false);
  }

  const quickActions = ["Cardiology", "Pediatrics", "Neurology", "Orthopedics"];

  const theme = darkMode ? dark : light;

  return (
    <div style={{ ...styles.page, background: theme.page }}>
      <div style={styles.chatContainer}>
        {/* Header */}
        <div style={{ ...styles.header, background: theme.header }}>
          <span style={styles.headerText}>We are online</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={styles.darkToggle}
            title="Toggle dark mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Messages */}
        <div style={{ ...styles.messages, background: theme.messages }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                ...styles.bubbleWrapper,
                justifyContent:
                  m.role === "user" ? "flex-end" : "flex-start"
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  background:
                    m.role === "user" ? theme.userBubble : theme.botBubble,
                  color: theme.text
                }}
              >
                <div style={styles.messageText}>{m.content}</div>
                <div style={styles.time}>
                  {m.time.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>

                {m.role === "assistant" && (
                  <div style={styles.quickActions}>
                    {quickActions.map((q) => (
                      <button
                        key={q}
                        style={styles.quickActionBtn}
                        onClick={() => sendMessage(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={styles.bubbleWrapper}>
              <div style={{ ...styles.bubble, background: theme.botBubble }}>
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ ...styles.inputBar, background: theme.input }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your message…"
            style={styles.input}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={() => sendMessage()} style={styles.sendBtn}>
            Send
          </button>
        </div>

        <div style={styles.footer}>Powered by Bilal AI Studio</div>
      </div>
    </div>
  );
}

/* ---------- Typing Animation ---------- */
function TypingDots() {
  return <span style={styles.dots}>Typing<span>.</span><span>.</span><span>.</span></span>;
}

/* ---------- THEMES ---------- */
const light = {
  page: "#ffffff",
  header: "#0d6efd",
  messages: "#ffffff",
  userBubble: "#0d6efd",
  botBubble: "#e6f2ff",
  input: "#ffffff",
  text: "#000"
};

const dark = {
  page: "#0f172a",
  header: "#020617",
  messages: "#020617",
  userBubble: "#2563eb",
  botBubble: "#1e293b",
  input: "#020617",
  text: "#f8fafc"
};

/* ---------- STYLES ---------- */
const styles = {
  page: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column"
  },

  chatContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },

  header: {
    padding: "14px 16px",
    color: "#fff",
    fontSize: 17,
    fontWeight: 600,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
  },

  headerText: { letterSpacing: 0.4 },

  darkToggle: {
    background: "transparent",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#fff"
  },

  messages: {
    flex: 1,
    padding: 16,
    overflowY: "auto"
  },

  bubbleWrapper: {
    display: "flex",
    marginBottom: 12
  },

  bubble: {
    maxWidth: "75%",
    padding: "10px 14px",
    borderRadius: 18,
    fontSize: 14
  },

  messageText: {
    lineHeight: 1.5
  },

  time: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 4,
    textAlign: "right"
  },

  quickActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8
  },

  quickActionBtn: {
    padding: "5px 10px",
    borderRadius: 12,
    border: "1px solid #0d6efd",
    background: "#fff",
    cursor: "pointer",
    fontSize: 12
  },

  inputBar: {
    display: "flex",
    padding: 12,
    borderTop: "1px solid #ddd",
    boxShadow: "0 -2px 6px rgba(0,0,0,0.06)"
  },

  input: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ccc",
    fontSize: 14
  },

  sendBtn: {
    marginLeft: 8,
    padding: "0 18px",
    borderRadius: 10,
    border: "none",
    background: "#0d6efd",
    color: "#fff",
    cursor: "pointer"
  },

  footer: {
    textAlign: "center",
    fontSize: 12,
    padding: 6,
    opacity: 0.6
  },

  dots: {
    fontSize: 14,
    letterSpacing: 2
  }
};
