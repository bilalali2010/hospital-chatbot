"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ChatApp() {
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "1";

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! How can I help you today?"
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [knowledge, setKnowledge] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
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
    <div style={styles.wrapper}>
      <div style={styles.chatBox}>
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

        <div style={styles.inputBox}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            style={styles.input}
          />
          <button onClick={sendMessage} style={styles.button}>
            Send
          </button>
        </div>
      </div>

      {isAdmin && (
        <div style={styles.adminPanel}>
          <h3>Admin Knowledge Panel</h3>
          <p>
            Knowledge is loaded from <b>data/hospital.json</b>
          </p>
          <textarea
            value={knowledge}
            onChange={(e) => setKnowledge(e.target.value)}
            placeholder="Edit hospital.json in GitHub to update data"
            style={styles.textarea}
          />
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    padding: 20,
    background: "#f2f6f9",
    minHeight: "100vh"
  },
  chatBox: {
    width: "100%",
    maxWidth: 420,
    background: "#ffffff",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  },
  messages: {
    flex: 1,
    padding: 16,
    overflowY: "auto"
  },
  bubble: {
    padding: "10px 14px",
    borderRadius: 14,
    marginBottom: 10,
    maxWidth: "80%",
    fontSize: 14,
    lineHeight: 1.4
  },
  userBubble: {
    background: "#0d6efd",
    color: "#fff",
    alignSelf: "flex-end"
  },
  botBubble: {
    background: "#e9f1f8",
    color: "#000",
    alignSelf: "flex-start"
  },
  inputBox: {
    display: "flex",
    padding: 12,
    borderTop: "1px solid #ddd"
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc"
  },
  button: {
    marginLeft: 8,
    padding: "0 16px",
    borderRadius: 8,
    border: "none",
    background: "#0d6efd",
    color: "#fff",
    cursor: "pointer"
  },
  adminPanel: {
    marginLeft: 20,
    width: 300,
    background: "#fff",
    padding: 16,
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  },
  textarea: {
    width: "100%",
    height: 200,
    marginTop: 10
  }
};
