export default function Header({ clearChat }) {
  return (
    <div className="header">
      <div className="header-left">
        <div className="logo-placeholder">KM</div>

        <div>
          <h1>Khwaja Moinuddin Chishti Language University</h1>
          <p>Official Student Helpdesk Portal</p>
        </div>
      </div>

      <button className="clear-btn" onClick={clearChat}>
        Clear Chat
      </button>
    </div>
  );
}