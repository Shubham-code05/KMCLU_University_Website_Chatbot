export default function Header({ clearChat }) {
  return (
    <div className="chat-header">
      <div className="header-text">
        <h2>KMCLU Helpdesk Bot</h2>
        <p>AI Powered University Assistant</p>
      </div>

      <button className="clear-btn" onClick={clearChat}>
        🗑
      </button>
    </div>
  );
}