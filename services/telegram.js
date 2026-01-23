/**
 * Telegram API Service
 */

export async function sendMessage(chatId, text, env, keyboard = null) {
  const token = env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_TOKEN;
  if (!token) throw new Error("Токен бота не найден в переменных!");

  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };

  if (keyboard) {
    payload.reply_markup = keyboard;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return response.json();
}

export async function sendVideoNote(chatId, videoFileId, env) {
  const token = env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_TOKEN;
  
  const url = `https://api.telegram.org/bot${token}/sendVideoNote`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      video_note: videoFileId
    })
  });
  
  const result = await response.json();
  
  if (!result.ok) {
    console.error('Telegram API Error:', result);
    throw new Error(`Telegram API: ${result.description || 'Unknown error'}`);
  }
  
  return result;
}

export async function sendPhoto(chatId, photoUrl, caption, env, keyboard = null) {
  const token = env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_TOKEN;
  if (!token) throw new Error("Токен бота не найден в переменных!");

  const payload = {
    chat_id: chatId,
    photo: photoUrl,
    caption: caption,
    parse_mode: 'HTML'
  };

  if (keyboard) {
    payload.reply_markup = keyboard;
  }

  const url = `https://api.telegram.org/bot${token}/sendPhoto`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return response.json();
}

export async function answerCallbackQuery(callbackId, env) {
  const token = env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_TOKEN;
  return fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackId })
  });
}
