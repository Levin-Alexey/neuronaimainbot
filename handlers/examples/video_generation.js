/**
 * Пример: Генерация видео с помощью ИИ
 */
import { sendMessage } from '../../services/telegram.js';

const MESSAGE = `🎬 <b>Генерация видео с помощью ИИ</b>

Функция в разработке. Скоро здесь будет подробное описание примера.`;

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '⬅️ Назад', callback_data: 'portfolio' }]
  ]
};

export async function handleVideoGenerationExample(chatId, env) {
  return sendMessage(chatId, MESSAGE, env, KEYBOARD);
}
