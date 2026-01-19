/**
 * Пример: 3D Аватар ИИ на базе Unity
 */
import { sendMessage } from '../../services/telegram.js';

const MESSAGE = `🎭 <b>3D Аватар ИИ на базе Unity</b>

Функция в разработке. Скоро здесь будет подробное описание примера.`;

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '⬅️ Назад', callback_data: 'portfolio' }]
  ]
};

export async function handleUnityAvatarExample(chatId, env) {
  return sendMessage(chatId, MESSAGE, env, KEYBOARD);
}
