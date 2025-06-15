// src/utils/moderation.js

function contentModeration(text) {
  // Dummy logic: Replace bad words, etc.
  const badWords = ['badword1', 'badword2'];
  let moderatedText = text;

  for (const word of badWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    moderatedText = moderatedText.replace(regex, '****');
  }

  return moderatedText;
}

module.exports = { contentModeration };
