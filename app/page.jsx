"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const ADMIN_PASSWORD = "@supersecret";

export default function Home() {
  const searchParams = useSearchParams();
  const isAdminParam = searchParams.get("admin") === "1";

  const [isAdmin, setIsAdmin] = useState(false);
  const [businessData, setBusinessData] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  // Ask password only if admin=1
  useEffect(() => {
    if (isAdminParam) {
      const enteredPassword = prompt("Enter admin password:");
      if (enteredPassword === ADMIN_PASSWORD) {
        setIsAdmin(true);
      } else {
        alert("Wrong password");
      }
    }
  }, [isAdminParam]);

  const sendMessage = async () => {
    if (!message) return;

    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        businessData
      })
    });

    const data = await res.json();
    setReply(data.reply);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", fontFamily: "Arial" }}>
      <h2>🤖 Business AI Chatbot</h2>

      {/* ADMIN PANEL */}
      {isAdmin && (
        <>
          <h4>🔐 Admin Panel</h4>
          <textarea
            placeholder="Paste business information here..."
            rows={8}
            style={{ width: "100%" }}
            value={businessData}
            onChange={(e) => setBusinessData(e.target.value)}
          />
          <hr />
        </>
      )}

      <input
        placeholder="Ask a question..."
        style={{ width: "100%", padding: 10 }}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={sendMessage}
        style={{ marginTop: 10, padding: 10, width: "100%" }}
      >
        {loading ? "Thinking..." : "Send"}
      </button>

      {reply && (
        <p style={{ marginTop: 20 }}>
          <b>Reply:</b> {reply}
        </p>
      )}
    </div>
  );
}
