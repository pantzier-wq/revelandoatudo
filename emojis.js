const appleEmojis = {
    "⚠️": "26a0-fe0f",
    "🔒": "1f512",
    "🔍": "1f50d",
    "🕒": "1f552",
    "🎯": "1f3af",
    "🧠": "1f9e0",
    "♾️": "267e-fe0f",
    "👁️": "1f441-fe0f",
    "🛡️": "1f6e1-fe0f",
    "✔️": "2714-fe0f",
    "🚨": "1f6a8",
    "📥": "1f4e5",
    "👉": "1f449",
    "✅": "2705",
    "🛒": "1f6d2",
    "⚡": "26a1",
    "📂": "1f4c2",
    "🔪": "1f52a"
};

function applyAppleEmojis(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        let text = node.nodeValue;
        let hasEmoji = false;
        for (let e in appleEmojis) {
            if (text.includes(e)) { hasEmoji = true; break; }
        }
        if (hasEmoji) {
            const temp = document.createElement('span');
            let html = text;
            for (let [emoji, code] of Object.entries(appleEmojis)) {
                html = html.replaceAll(emoji, `<img src="https://cdnjs.cloudflare.com/ajax/libs/emoji-datasource-apple/15.0.1/img/apple/64/${code}.png" class="ios-emoji" alt="${emoji}">`);
            }
            temp.innerHTML = html;
            while (temp.firstChild) {
                node.parentNode.insertBefore(temp.firstChild, node);
            }
            node.parentNode.removeChild(node);
        }
    } else if (node.nodeType === Node.ELEMENT_NODE && !['SCRIPT', 'STYLE', 'TEXTAREA'].includes(node.nodeName)) {
        const children = Array.from(node.childNodes);
        for (let child of children) {
            applyAppleEmojis(child);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    applyAppleEmojis(document.body);
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((addedNode) => {
                if (addedNode.nodeType === Node.ELEMENT_NODE || addedNode.nodeType === Node.TEXT_NODE) {
                    applyAppleEmojis(addedNode);
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
});
