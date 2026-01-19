/**
 * Обработчик услуги "AI-генерация контента"
 */
import { sendMessage } from '../../services/telegram.js';

const MESSAGE = `🎬 <b>AI-генерация контента</b>

Функция в разработке. Скоро здесь будет подробное описание услуги.`;

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '⬅️ Назад', callback_data: 'services' }]
  ]
};

export async function handleContentGenerationOffer(chatId, env) {
  return sendMessage(chatId, MESSAGE, env, KEYBOARD);
}
