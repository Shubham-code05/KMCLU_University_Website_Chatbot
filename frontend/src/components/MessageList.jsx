// import Message from "./Message";

// export default function MessageList({ messages }) {
//   return (
//     <div className="chat-body">
//       {messages.map((msg, index) => (
//         <Message key={index} text={msg.text} sender={msg.sender} />
//       ))}
//     </div>
//   );
// }

import { useEffect, useRef } from "react";
import Message from "./Message";

export default function MessageList({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-body">
      {messages.map((msg, index) => (
        <Message key={index} text={msg.text} sender={msg.sender} />
      ))}

      <div ref={bottomRef}></div>
    </div>
  );
}