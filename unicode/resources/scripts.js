const inputPreview = document.getElementById('InputPreview');
const inputAfter = document.getElementById('InputAfter');

function updateText(e, inputBefore) {
    let str = inputBefore.value;
    
    inputAfter.value = str.normalize('NFC');

    if (str === str.normalize('NFC')) {
        inputPreview.textContent = str;
    }
    else if (str === str.normalize('NFD')) {
        let dispStr = '';
        for (const char of str) {
            /*
            // 3. Get the Unicode code point for each character
            // We use `codePointAt(0)` for accuracy with characters outside the Basic Multilingual Plane (like some emoji).
            const codePoint = char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
            const code = `U+${codePoint}`;
            */
            dispStr += char + '\u200B';
            // dispStr += String.fromCodePoint(parseInt(codePoint, 16));
            // dispStr += '&nbsp;'
            // inputPreview.textContent = code;
        }
        inputPreview.textContent = dispStr;
        // inputPreview.innerHTML = dispStr;
    }

    if (e === true || e.key === 'Enter') {
        //? copy
    }
}