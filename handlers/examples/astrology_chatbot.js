/**
 * Пример: Чат бот на базе ИИ по Астрологии
 */
import { sendMessage } from '../../services/telegram.js';

const MESSAGE = `🔮 <b>Чат бот на базе ИИ по Астрологии</b>

Функция в разработке. Скоро здесь будет подробное описание примера.`;

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '⬅️ Назад', callback_data: 'portfolio' }]
  ]
};

export async function handleAstrologyChatbotExample(chatId, env) {
  return sendMessage(chatId, MESSAGE, env, KEYBOARD);
}
