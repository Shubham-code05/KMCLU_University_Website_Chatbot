export default function Message({ text, sender }) {
  const formattedText = text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" style="color:#0b5ed7; text-decoration: underline;">$1</a>'
  );

  return (
    <div className={`message ${sender}`}>
      <span dangerouslySetInnerHTML={{ __html: formattedText }} />
    </div>
  );
}