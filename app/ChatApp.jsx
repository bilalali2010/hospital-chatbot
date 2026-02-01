"use client";
import { useEffect, useRef, useState } from "react";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [businessData, setBusinessData] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const chatEndRef = useRef(null);

  // detect admin mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "1") {
      const pwd = prompt("Enter admin password:");
      if (pwd === "@supersecret") {
        setIsAdmin(true);
      }
    }
  }, []);

  // auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();
    setMessages((prev) => [
      ...prev,
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

    if (res.ok) {
      alert("Business information saved successfully!");
    } else {
      alert("Failed to save data");
    }
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "0 auto",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #ddd",
        fontFamily: "sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: 12,
          background: "#2b4c7e",
          color: "#fff",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        HOSPITAL BOT
      </div>

      {/* CHAT WINDOW */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 10,
          background: "#f5f7fb",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent:
                m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                maxWidth: "75%",
                padding: "10px 14px",
                borderRadius: 16,
                background:
                  m.role === "user" ? "#2b4c7e" : "#e1e7f0",
                color: m.role === "user" ? "#fff" : "#000",
                fontSize: 14,
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div
        style={{
          display: "flex",
          padding: 10,
          borderTop: "1px solid #ddd",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write a message"
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 20,
            border: "1px solid #ccc",
            outline: "none",
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          style={{
            marginLeft: 8,
            padding: "0 16px",
            borderRadius: 20,
            background: "#2b4c7e",
            color: "#fff",
            border: "none",
          }}
        >
          Send
        </button>
      </div>

      {/* ADMIN PANEL */}
      {isAdmin && (
        <div style={{ padding: 10, borderTop: "1px solid #ccc" }}>
          <textarea
            placeholder="Paste business information here..."
            value={businessData}
            onChange={(e) => setBusinessData(e.target.value)}
            style={{
              width: "100%",
              height: 120,
              padding: 10,
              marginBottom: 8,
            }}
          />
          <button
            onClick={saveBusinessData}
            style={{
              width: "100%",
              padding: 10,
              background: "#1f7a3f",
              color: "#fff",
              border: "none",
            }}
          >
            Save Information
          </button>
        </div>
      )}
    </div>
  );
}
