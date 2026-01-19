/**
 * Пример: Генерация изображений с помощью ИИ
 */
import { sendMessage } from '../../services/telegram.js';

const MESSAGE = `🖼️ <b>Генерация изображений с помощью ИИ</b>

Функция в разработке. Скоро здесь будет подробное описание примера.`;

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '⬅️ Назад', callback_data: 'portfolio' }]
  ]
};

export async function handleImageGenerationExample(chatId, env) {
  return sendMessage(chatId, MESSAGE, env, KEYBOARD);
}
