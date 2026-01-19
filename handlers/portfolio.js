/**
 * Обработчик раздела "Портфолио"
 */
import { sendMessage } from '../services/telegram.js';

const PORTFOLIO_MESSAGE = `🎨 <b>Наше портфолио:</b>

Кейс 1: Бот для риелторов
Кейс 2: Анализ звонков`;

const PORTFOLIO_KEYBOARD = {
  inline_keyboard: [
    [{ text: '📱 ИИ чат-бот репетитор', callback_data: 'example_tutor_bot' }],
    [{ text: '🎙️ AI-голосовой бот VAPI', callback_data: 'example_vapi_bot' }],
    [{ text: '🤖 ИИ чат бот Vertex AI', callback_data: 'example_vertex_ai_bot' }],
    [{ text: '🛒 ИИ чат бот Dify', callback_data: 'example_dify_bot' }],
    [{ text: '🖼️ Оживление фотографий', callback_data: 'example_photo_animation' }],
    [{ text: '🏢 Корпоративный ИИ-ассистент', callback_data: 'example_corporate_assistant' }],
    [{ text: '🎬 Генерация видео с ИИ', callback_data: 'example_video_generation' }],
    [{ text: '🖼️ Генерация изображений', callback_data: 'example_image_generation' }],
    [{ text: '🎭 3D Аватар HeyGen', callback_data: 'example_heygen_avatar' }],
    [{ text: '🎭 3D Аватар Unity', callback_data: 'example_unity_avatar' }],
    [{ text: '🔮 Чат бот по Астрологии', callback_data: 'example_astrology_chatbot' }],
    [{ text: '⚙️ Автоматизация N8N', callback_data: 'example_n8n_automation' }],
    [{ text: '⬅️ Назад', callback_data: 'back' }]
  ]
};

export async function handlePortfolioFlow(chatId, env) {
  return sendMessage(chatId, PORTFOLIO_MESSAGE, env, PORTFOLIO_KEYBOARD);
}
