/**
 * Пример: Автоматизация бизнес-процессов на N8N
 */
import { sendMessage } from '../../services/telegram.js';

const MESSAGE = `⚙️ <b>Автоматизация бизнес-процессов на N8N</b>

Функция в разработке. Скоро здесь будет подробное описание примера.`;

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '⬅️ Назад', callback_data: 'portfolio' }]
  ]
};

export async function handleN8NAutomationExample(chatId, env) {
  return sendMessage(chatId, MESSAGE, env, KEYBOARD);
}
