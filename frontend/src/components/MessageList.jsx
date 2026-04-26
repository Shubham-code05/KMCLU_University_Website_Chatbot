import { useEffect, useRef } from "react";
import Message from "./Message";

export default function MessageList({ messages }) {
  const bottomRef = useRef(null);

  // ✅ Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-body">
      {messages.map((msg, index) => {
        // ✅ Typing animation handle
        if (msg.text === "Typing...") {
          return (
            <div key={index} className="message bot">
              <span className="typing">
                Typing<span>.</span><span>.</span><span>.</span>
              </span>
            </div>
          );
        }

        // ✅ Normal message
        return (
          <Message key={index} text={msg.text} sender={msg.sender} />
        );
      })}

      {/* ✅ Scroll anchor */}
      <div ref={bottomRef}></div>
    </div>
  );
}