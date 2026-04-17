export default function Header({ clearChat }) {
  return (
    <div className="header">
      <div className="header-left">
        <div className="logo-placeholder">KMCLU</div>

        <div className="header-text">
          <h1>Khwaja Moinuddin Chishti Language University</h1>

          <p>Official Student Helpdesk Portal</p>

          <p className="header-subline">
            Ask anything about admissions, fees, hostel, exams and courses.
          </p>
        </div>
      </div>

      <button className="clear-btn" onClick={clearChat}>
        Clear Chat
      </button>
    </div>
  );
}