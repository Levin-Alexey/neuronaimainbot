/**
 * Пример: AI-голосовой бот на базе VAPI с RAG
 */
import { sendMessage } from '../../services/telegram.js';

const MESSAGE = `🎙️ <b>AI-голосовой бот на базе VAPI с RAG</b>

Функция в разработке. Скоро здесь будет подробное описание примера.`;

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '⬅️ Назад', callback_data: 'portfolio' }]
  ]
};

export async function handleVAPIBotExample(chatId, env) {
  return sendMessage(chatId, MESSAGE, env, KEYBOARD);
}
