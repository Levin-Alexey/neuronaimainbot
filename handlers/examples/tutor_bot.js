/**
 * Пример: ИИ чат-бот репетитор английского языка
 */
import { sendMessage } from '../../services/telegram.js';

const MESSAGE = `📱 <b>ИИ чат-бот репетитор английского языка</b>

Функция в разработке. Скоро здесь будет подробное описание примера.`;

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '⬅️ Назад', callback_data: 'portfolio' }]
  ]
};

export async function handleTutorBotExample(chatId, env) {
  return sendMessage(chatId, MESSAGE, env, KEYBOARD);
}
