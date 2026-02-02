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

  // Scroll to latest message automatically
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

  // Example quick action buttons (departments)
  const quickActions = ["Cardiology", "Pediatrics", "Neurology", "Orthopedics"];

  return (
    <div style={styles.page}>
      <div style={styles.chatCard}>
        {/* Header */}
        <div style={styles.header}>
          <img
            src="/hospital-logo.png"
            alt="Hospital Logo"
            style={styles.logo}
          />
          <span>We are online!</span>
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
              {m.content}
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
              Typing…
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #e8f4ff, #f7fbff)",
    padding: 12
  },

  chatCard: {
    width: "100%",
    maxWidth: 420,
    height: "100%",
    maxHeight: 640,
    background: "#ffffff",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
    overflow: "hidden",
    transition: "all 0.3s ease"
  },

  header: {
    background: "#0d6efd",
    color: "#fff",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 500,
    fontSize: 16
  },

  logo: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    objectFit: "cover"
  },

  messages: {
    flex: 1,
    padding: 16,
    overflowY: "auto",
    background: "#f9fcff",
    display: "flex",
    flexDirection: "column"
  },

  bubble: {
    padding: "10px 14px",
    borderRadius: 14,
    marginBottom: 10,
    fontSize: 14,
    lineHeight: 1.45,
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
    outline: "none"
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
