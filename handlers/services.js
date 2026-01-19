/**
 * Обработчик раздела "Наши услуги"
 */
import { sendMessage } from '../services/telegram.js';

const SERVICES_MESSAGE = `🛠️ <b>Наши услуги:</b>

1. Внедрение LLM
2. Чат-боты
3. Аналитика данных`;

const SERVICES_KEYBOARD = {
  inline_keyboard: [
    [{ text: '💬 Чат-боты', callback_data: 'offer_chatbots' }],
    [{ text: '🎙️ Голосовые боты', callback_data: 'offer_voice_bots' }],
    [{ text: '🎭 3D-аватары с ИИ', callback_data: 'offer_avatars' }],
    [{ text: '🎬 AI-генерация контента', callback_data: 'offer_content_generation' }],
    [{ text: '⚙️ Автоматизация процессов', callback_data: 'offer_automation' }],
    [{ text: '🔗 Интеграция AI в процессы', callback_data: 'offer_integration' }],
    [{ text: '🧠 Индивидуальная разработка', callback_data: 'offer_custom_development' }],
    [{ text: '💡 Консультация и аудит', callback_data: 'offer_consultation' }],
    [{ text: '⬅️ Назад', callback_data: 'back' }]
  ]
};

export async function handleServicesFlow(chatId, env) {
  return sendMessage(chatId, SERVICES_MESSAGE, env, SERVICES_KEYBOARD);
}
