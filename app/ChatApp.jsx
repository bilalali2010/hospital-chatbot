"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

const ADMIN_PASSWORD = "@supersecret";

export default function HospitalChatApp() {
  const searchParams = useSearchParams();
  const isAdminParam = searchParams.get("admin") === "1";

  const [isAdmin, setIsAdmin] = useState(false);
  const [hospitalData, setHospitalData] = useState(""); // hospital info
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const chatEndRef = useRef(null);

  // Scroll to bottom when new message
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Load hospital data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("hospitalData") || "";
    setHospitalData(savedData);
  }, []);

  // Check admin password
  useEffect(() => {
    if (isAdminParam) {
      const enteredPassword = prompt("Enter admin password:");
      if (enteredPassword === ADMIN_PASSWORD) setIsAdmin(true);
      else alert("Wrong password");
    }
  }, [isAdminParam]);

  // Save hospital data to localStorage
  const saveHospitalData = () => {
    if (!hospitalData.trim()) {
      alert("Hospital information cannot be empty!");
      return;
    }
    localStorage.setItem("hospitalData", hospitalData);
    alert("Hospital information saved!");
  };

  // Send message to API
  const sendMessage = async (msg = message) => {
    if (!msg) return;
    setLoading(true);
    setMessages((prev) => [...prev, { type: "user", text: msg }]);
    setMessage("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, hospitalData }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { type: "bot", text: data.reply }]);
      setQuickReplies([]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Error: could not get response." },
      ]);
    }

    setLoading(false);
  };

  const handleQuickReply = (btn) => {
    sendMessage(btn);
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "50px auto",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        height: "80vh",
        border: "1px solid #ccc",
        borderRadius: 12,
        overflow: "hidden",
        background: "#f8f9fa",
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          padding: "10px 20px",
          background: "#0d6efd",
          color: "#fff",
          fontWeight: "bold",
          fontSize: 18,
        }}
      >
        🏥 Hospital AI Chatbot
      </div>

      {/* Admin Panel */}
      {isAdmin && (
        <div style={{ padding: 10, background: "#e9ecef" }}>
          <h4>🔐 Hospital Admin Panel</h4>
          <textarea
            placeholder="Paste hospital info here..."
            rows={4}
            style={{ width: "100%", borderRadius: 6, padding: 6 }}
            value={hospitalData}
            onChange={(e) => setHospitalData(e.target.value)}
          />
          <button
            onClick={saveHospitalData}
            style={{
              marginTop: 6,
              padding: 8,
              width: "100%",
              borderRadius: 6,
              background: "#0d6efd",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            💾 Save Hospital Information
          </button>
        </div>
      )}

      {/* Chat messages */}
      <div
        style={{
          flex: 1,
          padding: 10,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          background: "#f1f3f5",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.type === "user" ? "flex-end" : "flex-start",
              background: m.type === "user" ? "#0d6efd" : "#e9ecef",
              color: m.type === "user" ? "#fff" : "#000",
              padding: "8px 12px",
              borderRadius: 16,
              maxWidth: "80%",
              wordBreak: "break-word",
            }}
          >
            {m.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Reply Buttons */}
      {quickReplies.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 10 }}>
          {quickReplies.map((btn, i) => (
            <button
              key={i}
              style={{
                padding: "6px 12px",
                borderRadius: 12,
                border: "1px solid #0d6efd",
                background: "#fff",
                cursor: "pointer",
                flex: "auto",
              }}
              onClick={() => handleQuickReply(btn)}
            >
              {btn}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div style={{ display: "flex", padding: 10, gap: 6, background: "#fff" }}>
        <input
          placeholder="Write a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 12,
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={() => sendMessage()}
          style={{
            padding: "0 16px",
            borderRadius: 12,
            background: "#0d6efd",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
