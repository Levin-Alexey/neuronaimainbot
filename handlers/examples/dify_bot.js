/**
 * Пример: ИИ чат бот на базе Dify
 */
import { sendMessage } from '../../services/telegram.js';

const MESSAGE = `🛒 <b>ИИ чат бот на базе Dify</b>

Функция в разработке. Скоро здесь будет подробное описание примера.`;

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '⬅️ Назад', callback_data: 'portfolio' }]
  ]
};

export async function handleDifyBotExample(chatId, env) {
  return sendMessage(chatId, MESSAGE, env, KEYBOARD);
}
