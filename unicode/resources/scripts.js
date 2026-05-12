const previewText = document.getElementById("PreviewText");
const inputAfterText = document.getElementById("InputAfterText");

function copyToClipboard(elmt) {
  text = inputAfterText.textContent;
  navigator.clipboard
    .writeText(text)
    .then(() => {
      elmt.classList.add("copied");
      setTimeout(() => {
        elmt.classList.remove("copied");
      }, 500);
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
    });
}

function updateText(e, inputBefore) {
  let str = inputBefore.value;
  let dispStr = "";

  inputAfterText.innerHTML = str.normalize("NFC");

  if (str === str.normalize("NFC")) {
    dispStr = str;
  } else if (str === str.normalize("NFD")) {

    for (const char of str) {
      /*
            // 3. Get the Unicode code point for each character
            // We use `codePointAt(0)` for accuracy with characters outside the Basic Multilingual Plane (like some emoji).
            const codePoint = char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
            const code = `U+${codePoint}`;
            */
      dispStr += char + "\u200B";
      // dispStr += String.fromCodePoint(parseInt(codePoint, 16));
      // dispStr += '&nbsp;'
      // previewText.textContent = code;
    }
    // inputPreview.innerHTML = dispStr;
  }
  if (dispStr == "") dispStr = "-";
  previewText.textContent = dispStr;

  if (e === true || e.key === "Enter") {
    //? copy
  }
}
