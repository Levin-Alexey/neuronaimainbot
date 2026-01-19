/**
 * Обработчик услуги "3D-аватары с ИИ"
 */
import { sendMessage } from '../../services/telegram.js';

const MESSAGE = `🎭 <b>3D-аватары с ИИ</b>

Функция в разработке. Скоро здесь будет подробное описание услуги.`;

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '⬅️ Назад', callback_data: 'services' }]
  ]
};

export async function handleAvatarsOffer(chatId, env) {
  return sendMessage(chatId, MESSAGE, env, KEYBOARD);
}
