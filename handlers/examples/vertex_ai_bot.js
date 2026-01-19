/**
 * Пример: ИИ чат бот на базе Google Vertex AI
 */
import { sendMessage } from '../../services/telegram.js';

const MESSAGE = `🤖 <b>ИИ чат бот на базе Google Vertex AI</b>

Функция в разработке. Скоро здесь будет подробное описание примера.`;

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '⬅️ Назад', callback_data: 'portfolio' }]
  ]
};

export async function handleVertexAIBotExample(chatId, env) {
  return sendMessage(chatId, MESSAGE, env, KEYBOARD);
}
