/**
 * Обработчик услуги "Интеграция AI в процессы"
 */
import { sendMessage } from '../../services/telegram.js';

const MESSAGE = `🔗 <b>Интеграция AI в процессы</b>

Функция в разработке. Скоро здесь будет подробное описание услуги.`;

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '⬅️ Назад', callback_data: 'services' }]
  ]
};

export async function handleIntegrationOffer(chatId, env) {
  return sendMessage(chatId, MESSAGE, env, KEYBOARD);
}
