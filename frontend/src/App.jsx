import { useState, useEffect } from "react";
import Chatbot from "./components/Chatbot";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // ✅ Apply dark class on body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="app">
      <button
        className="theme-toggle"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      <Chatbot />
    </div>
  );
}

export default App;