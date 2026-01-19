/**
 * Обработчик услуги "Чат-боты"
 */
import { sendMessage } from '../../services/telegram.js';

const MESSAGE = `💬 <b>Чат-боты</b>

Функция в разработке. Скоро здесь будет подробное описание услуги.`;

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '⬅️ Назад', callback_data: 'services' }]
  ]
};

export async function handleChatbotsOffer(chatId, env) {
  return sendMessage(chatId, MESSAGE, env, KEYBOARD);
}
