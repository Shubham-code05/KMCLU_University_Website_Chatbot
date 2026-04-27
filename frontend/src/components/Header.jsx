export default function Header({ clearChat }) {
  return (
    <div className="header">
      <div className="header-left">
        
        {/* ✅ Logo Image */}
        <img 
          src="/logo.png" 
          alt="KMCLU Logo" 
          className="logo-img"
        />

        {/* ✅ Text */}
        <div className="header-text">
          <h1>Khwaja Moinuddin Chishti Language University</h1>

          <p>Official Student Helpdesk Portal</p>

          <p className="header-subline">
            Ask anything about admissions, fees, hostel, exams and courses.
          </p>
        </div>
      </div>

      {/* ✅ Clear Button */}
      <button className="clear-btn" onClick={clearChat}>
        Clear Chat
      </button>
    </div>
  );
}