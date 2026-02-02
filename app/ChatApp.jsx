"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ChatApp() {
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "1";

  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi 👋 How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(msg = null) {
    const messageToSend = msg || input.trim();
    if (!messageToSend) return;

    setMessages((prev) => [...prev, { role: "user", content: messageToSend }]);
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
      { role: "assistant", content: data.reply }
    ]);
    setLoading(false);
  }

  const quickActions = ["Cardiology", "Pediatrics", "Neurology", "Orthopedics"];

  return (
    <div style={styles.page}>
      {/* Chat container stretched full screen */}
      <div style={styles.chatContainer}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.headerText}>We are online!</span>
        </div>

        {/* Messages */}
        <div style={styles.messages}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                ...styles.bubble,
                ...(m.role === "user" ? styles.userBubble : styles.botBubble)
              }}
            >
              <span
                style={m.role === "assistant" ? styles.botMessageText : styles.userMessageText}
              >
                {m.content}
              </span>

              {m.role === "assistant" && quickActions.length > 0 && (
                <div style={styles.quickActions}>
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      style={styles.quickActionBtn}
                      onClick={() => sendMessage(action)}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.bubble, ...styles.botBubble }}>
              <span style={styles.botMessageText}>Typing…</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={styles.inputBar}>
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

        {/* Footer Branding */}
        <div style={styles.footer}>Powered by Bilal AI Studio</div>
      </div>

      {isAdmin && (
        <div style={styles.adminNote}>
          <b>Admin Mode:</b>  
          Knowledge is loaded from <code>data/hospital.json</code>.  
          Edit that file and redeploy to update information.
        </div>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    height: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #e8f4ff, #f7fbff)",
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch", // stretch full height
    overflow: "hidden",
    flexDirection: "column"
  },

  chatContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  header: {
    background: "#0d6efd",
    color: "#fff",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  headerText: {
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: 0.5,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },

  messages: {
    flex: 1,
    padding: 16,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },

  bubble: {
    padding: "12px 16px",
    borderRadius: 18,
    marginBottom: 10,
    maxWidth: "80%",
    transition: "all 0.2s ease"
  },

  userBubble: {
    alignSelf: "flex-end",
    background: "#0d6efd",
    color: "#fff"
  },

  botBubble: {
    alignSelf: "flex-start",
    background: "#e6f2ff",
    color: "#000"
  },

  userMessageText: {
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.5,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },

  botMessageText: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.5,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },

  quickActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8
  },

  quickActionBtn: {
    padding: "6px 12px",
    borderRadius: 12,
    border: "1px solid #0d6efd",
    background: "#ffffff",
    color: "#0d6efd",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    transition: "all 0.2s ease",
  },

  inputBar: {
    display: "flex",
    padding: 12,
    borderTop: "1px solid #e0e0e0",
    background: "#ffffff"
  },

  input: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ccc",
    fontSize: 14,
    outline: "none",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },

  sendBtn: {
    marginLeft: 8,
    padding: "0 16px",
    borderRadius: 10,
    border: "none",
    background: "#0d6efd",
    color: "#fff",
    fontWeight: 500,
    cursor: "pointer"
  },

  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#555",
    padding: 6
  },

  adminNote: {
    marginTop: 10,
    fontSize: 12,
    color: "#444",
    textAlign: "center"
  }
};
