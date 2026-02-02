"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ChatApp() {
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "1";

  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input })
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.reply }
    ]);
    setLoading(false);
  }

  return (
    <div style={styles.page}>
      <div style={styles.chatCard}>
        {/* Chat messages */}
        <div style={styles.messages}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                ...styles.bubble,
                ...(m.role === "user"
                  ? styles.userBubble
                  : styles.botBubble)
              }}
            >
              {m.content}
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.bubble, ...styles.botBubble }}>
              Typing…
            </div>
          )}
        </div>

        {/* Input bar */}
        <div style={styles.inputBar}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here…"
            style={styles.input}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} style={styles.sendBtn}>
            Send
          </button>
        </div>
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
    overflow: "hidden"
  },

  messages: {
    flex: 1,
    padding: 16,
    overflowY: "auto",
    background: "#f9fcff"
  },

  bubble: {
    padding: "10px 14px",
    borderRadius: 14,
    marginBottom: 10,
    fontSize: 14,
    lineHeight: 1.45,
    maxWidth: "80%"
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

  adminNote: {
    marginTop: 10,
    fontSize: 12,
    color: "#444",
    textAlign: "center"
  }
};
