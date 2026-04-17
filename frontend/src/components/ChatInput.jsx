export default function ChatInput({ input, setInput, sendMessage }) {
  return (
    <div className="chat-footer">
      <input
        type="text"
        placeholder="Type your question here..."
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