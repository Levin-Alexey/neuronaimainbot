/**
 * Обработчик услуги "Консультация и аудит"
 */
import { sendMessage } from '../../services/telegram.js';

const MESSAGE = `💡 <b>Консультация и аудит</b>

Функция в разработке. Скоро здесь будет подробное описание услуги.`;

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '⬅️ Назад', callback_data: 'services' }]
  ]
};

export async function handleConsultationOffer(chatId, env) {
  return sendMessage(chatId, MESSAGE, env, KEYBOARD);
}
