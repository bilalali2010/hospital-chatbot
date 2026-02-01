"use client"; // ensures client-side only

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const ADMIN_PASSWORD = "@supersecret";

export default function ChatApp() {
  const searchParams = useSearchParams();
  const isAdminParam = searchParams.get("admin") === "1";

  const [isAdmin, setIsAdmin] = useState(false);
  const [businessData, setBusinessData] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  // Ask for password if admin param is present
  useEffect(() => {
    if (isAdminParam) {
      const enteredPassword = prompt("Enter admin password:");
      if (enteredPassword === ADMIN_PASSWORD) setIsAdmin(true);
      else alert("Wrong password");
    }
  }, [isAdminParam]);

  const sendMessage = async () => {
    if (!message) return;
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, businessData })
      });

      const data = await res.json();
      setReply(data.reply);
    } catch (err) {
      setReply("Error: could not get a response.");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", fontFamily: "Arial" }}>
      <h2>🤖 Business AI Chatbot</h2>

      {isAdmin && (
        <>
          <h4>🔐 Admin Panel</h4>
          <textarea
            placeholder="Paste business info here..."
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
