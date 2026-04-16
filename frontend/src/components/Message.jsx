export default function Message({ text, sender }) {
  const formattedText = text
    .replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#0b5ed7; text-decoration: underline;">$1</a>'
    )
    .replace(/\n/g, "<br />");

  return (
    <div
      className={`message ${sender}`}
      style={{ whiteSpace: "pre-wrap" }}
    >
      <span dangerouslySetInnerHTML={{ __html: formattedText }} />
    </div>
  );
}