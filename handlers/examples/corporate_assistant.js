/**
 * Пример: Корпоративный ИИ-ассистент (закрытый сервер)
 */
import { sendMessage } from '../../services/telegram.js';

const MESSAGE = `🏢 <b>Корпоративный ИИ-ассистент (закрытый сервер)</b>

Функция в разработке. Скоро здесь будет подробное описание примера.`;

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '⬅️ Назад', callback_data: 'portfolio' }]
  ]
};

export async function handleCorporateAssistantExample(chatId, env) {
  return sendMessage(chatId, MESSAGE, env, KEYBOARD);
}
