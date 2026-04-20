import { useRef } from "react";
import { HiMiniMicrophone, HiPaperAirplane } from "react-icons/hi2";

export default function ChatInput({ input, setInput, sendMessage }) {
  const recognitionRef = useRef(null);

  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input browser me support nahi karta.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setInput(text);
    };

    recognition.onerror = () => {
      alert("Voice input kaam nahi kar raha. Dobara try karo.");
    };

    recognitionRef.current = recognition;
  };

  return (
    <div className="chat-footer">
      <input
        type="text"
        placeholder="Ask anything about KMCLU..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
      />

      <button className="mic-btn" onClick={startVoice}>
        <HiMiniMicrophone size={24} />
      </button>

      <button className="send-btn" onClick={() => sendMessage()}>
        <HiPaperAirplane size={22} />
      </button>
    </div>
  );
}