// export default function QuickButtons({ sendMessage }) {
//   return (
//     <div className="quick-buttons">
//       <button onClick={() => sendMessage("admission")}>
//         🎓 Admission
//       </button>

//       <button onClick={() => sendMessage("exam")}>
//         📝 Exam
//       </button>

//       <button onClick={() => sendMessage("fee structure")}>
//         💰 Fee
//       </button>

//       <button onClick={() => sendMessage("contact")}>
//         📞 Contact
//       </button>

//       <button onClick={() => sendMessage("courses")}>
//         📚 Courses
//       </button>

//       <button onClick={() => sendMessage("hostel")}>
//         🏠 Hostel
//       </button>

//       <button onClick={() => sendMessage("library")}>
//         📖 Library
//       </button>

//       <button onClick={() => sendMessage("scholarship")}>
//         🎁 Scholarship
//       </button>
//     </div>
//   );
// }



export default function QuickButtons({ sendMessage }) {
  // ✅ All buttons data in one place
  const buttons = [
    { text: "🎓 Admission", value: "admission" },
    { text: "📝 Exam", value: "exam" },
    { text: "💰 Fee", value: "fee structure" },
    { text: "📞 Contact", value: "contact" },
    { text: "📚 Courses", value: "courses" },
    { text: "🏠 Hostel", value: "hostel" },
    { text: "📖 Library", value: "library" },
    { text: "🎁 Scholarship", value: "scholarship" },
  ];

  return (
    <div className="quick-buttons">
      {buttons.map((btn, index) => (
        <button key={index} onClick={() => sendMessage(btn.value)}>
          {btn.text}
        </button>
      ))}
    </div>
  );
}