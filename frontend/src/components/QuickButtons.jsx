export default function QuickButtons({ sendMessage }) {
  return (
    <div className="quick-buttons">
      <button onClick={() => sendMessage("admission")}>
        🎓 Admission
      </button>

      <button onClick={() => sendMessage("exam")}>
        📝 Exam
      </button>

      <button onClick={() => sendMessage("fee structure")}>
        💰 Fee
      </button>

      <button onClick={() => sendMessage("contact")}>
        📞 Contact
      </button>

      <button onClick={() => sendMessage("courses")}>
        📚 Courses
      </button>

      <button onClick={() => sendMessage("hostel")}>
        🏠 Hostel
      </button>

      <button onClick={() => sendMessage("library")}>
        📖 Library
      </button>

      <button onClick={() => sendMessage("scholarship")}>
        🎁 Scholarship
      </button>
    </div>
  );
}