import { useState } from "react";
import Header from "./Header";
import QuickButtons from "./QuickButtons";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      text: "👋 Welcome to KMCLU Helpdesk Bot",
      sender: "bot",
    },
  ]);

  const [input, setInput] = useState("");

  const clearChat = () => {
    setMessages([
      {
        text: "👋 Welcome to KMCLU Helpdesk Bot",
        sender: "bot",
      },
    ]);
  };

  const sendMessage = async (customMessage) => {
    const messageToSend = customMessage || input;

    if (!messageToSend.trim()) return;

    const updatedMessages = [
      ...messages,
      {
        text: messageToSend,
        sender: "user",
      },
      {
        text: "Typing...",
        sender: "bot",
      },
    ];

    setMessages(updatedMessages);
    setInput("");

    try {
      const response = await fetch("https://kmclu-university-website-chatbot.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      const data = await response.json();

      setMessages([
        ...updatedMessages.slice(0, -1),
        {
          text: data.reply,
          sender: "bot",
        },
      ]);
    } catch (error) {
      setMessages([
        ...updatedMessages.slice(0, -1),
        {
          text: "❌ Backend se connection nahi ho paaya.",
          sender: "bot",
        },
      ]);
    }
  };

  return (
    <div className="chatbot-container">
      <Header clearChat={clearChat} />

      <QuickButtons sendMessage={sendMessage} />

      <MessageList messages={messages} />

      <ChatInput
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
      />
    </div>
  );
}