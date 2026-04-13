export default function ChatInput({ input, setInput, sendMessage }) {
  return (
    <div className="chat-footer">
      <input
        type="text"
        placeholder="Ask about admission, exam, fee..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
      />

      <button onClick={() => sendMessage()}>➤</button>
    </div>
  );
}