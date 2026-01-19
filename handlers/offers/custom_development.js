/**
 * Обработчик услуги "Индивидуальная разработка решений"
 */
import { sendMessage } from '../../services/telegram.js';

const MESSAGE = `🧠 <b>Индивидуальная разработка решений</b>

Функция в разработке. Скоро здесь будет подробное описание услуги.`;

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '⬅️ Назад', callback_data: 'services' }]
  ]
};

export async function handleCustomDevelopmentOffer(chatId, env) {
  return sendMessage(chatId, MESSAGE, env, KEYBOARD);
}
