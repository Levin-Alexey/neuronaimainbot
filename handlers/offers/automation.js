/**
 * Обработчик услуги "Автоматизация процессов"
 */
import { sendMessage } from '../../services/telegram.js';

const MESSAGE = `⚙️ <b>Автоматизация процессов</b>

Функция в разработке. Скоро здесь будет подробное описание услуги.`;

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '⬅️ Назад', callback_data: 'services' }]
  ]
};

export async function handleAutomationOffer(chatId, env) {
  return sendMessage(chatId, MESSAGE, env, KEYBOARD);
}
