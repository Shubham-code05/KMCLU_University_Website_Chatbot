(function () {
  // Floating Button
  const button = document.createElement("div");
  button.innerHTML = "💬";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.width = "60px";
  button.style.height = "60px";
  button.style.background = "#0b5d91";
  button.style.color = "#fff";
  button.style.display = "flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.borderRadius = "50%";
  button.style.cursor = "pointer";
  button.style.zIndex = "9999";
  button.style.fontSize = "24px";

  document.body.appendChild(button);

  // Chatbot Box (iframe)
  const iframe = document.createElement("iframe");
  iframe.src = "https://kmclu-university-website-chatbot.vercel.app"; // 👈 apna frontend link
  iframe.style.position = "fixed";
  iframe.style.bottom = "90px";
  iframe.style.right = "20px";
  iframe.style.width = "350px";
  iframe.style.height = "500px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "12px";
  iframe.style.display = "none";
  iframe.style.zIndex = "9999";

  document.body.appendChild(iframe);

  // Toggle
  button.onclick = () => {
    iframe.style.display =
      iframe.style.display === "none" ? "block" : "none";
  };
})();