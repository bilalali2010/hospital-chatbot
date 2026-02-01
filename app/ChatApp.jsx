"use client";
import { useEffect, useRef, useState } from "react";

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
      const pwd = prompt("Enter admin password");
      if (pwd === "@supersecret") setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((p) => [...p, { role: "user", content: input }]);
    setInput("");
    setIsTyping(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();
    setIsTyping(false);

    setMessages((p) => [
      ...p,
      { role: "assistant", content: data.reply },
    ]);
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
    alert(res.ok ? "Information saved" : "Save failed");
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.chatArea}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.row,
              justifyContent:
                m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                ...styles.bubble,
                ...(m.role === "user"
                  ? styles.userBubble
                  : styles.botBubble),
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={styles.row}>
            <div style={styles.botBubble}>
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div style={styles.inputBar}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message…"
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.sendBtn}>
          Send
        </button>
      </div>

      {isAdmin && (
        <div style={styles.admin}>
          <textarea
            value={businessData}
            onChange={(e) => setBusinessData(e.target.value)}
            placeholder="Paste hospital information here"
            style={styles.textarea}
          />
          <button onClick={saveBusinessData} style={styles.saveBtn}>
            Save Information
          </button>
        </div>
      )}

      <style>{`
        .dot {
          animation: blink 1.4s infinite both;
          font-size: 22px;
        }
        .dot:nth-child(2) { animation-delay: .2s; }
        .dot:nth-child(3) { animation-delay: .4s; }

        @keyframes blink {
          0% { opacity: .2 }
          20% { opacity: 1 }
          100% { opacity: .2 }
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: 420,
    margin: "0 auto",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f8fbfd",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
  },
  chatArea: {
    flex: 1,
    padding: "16px 12px",
    overflowY: "auto",
  },
  row: {
    display: "flex",
    marginBottom: 12,
  },
  bubble: {
    padding: "11px 15px",
    borderRadius: 18,
    maxWidth: "78%",
    fontSize: 14.5,
    lineHeight: 1.45,
  },
  userBubble: {
    background: "#0f4c81",
    color: "#fff",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    background: "#e6f0fa",
    color: "#0b2540",
    borderBottomLeftRadius: 4,
  },
  inputBar: {
    display: "flex",
    padding: 12,
    borderTop: "1px solid #dbe7f3",
    background: "#ffffff",
  },
  input: {
    flex: 1,
    padding: "11px 14px",
    borderRadius: 20,
    border: "1px solid #cfe0f1",
    fontSize: 14,
    outline: "none",
  },
  sendBtn: {
    marginLeft: 8,
    padding: "0 18px",
    borderRadius: 20,
    border: "none",
    background: "#0f4c81",
    color: "#fff",
    fontSize: 14,
    cursor: "pointer",
  },
  admin: {
    padding: 12,
    borderTop: "1px solid #dbe7f3",
    background: "#f1f6fb",
  },
  textarea: {
    width: "100%",
    height: 110,
    padding: 10,
    fontSize: 13,
  },
  saveBtn: {
    marginTop: 8,
    width: "100%",
    padding: 10,
    background: "#0b2540",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};
