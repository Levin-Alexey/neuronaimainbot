/**
 * Neuron AI - Main Router
 */
import { saveUserToDb } from './services/supabase.js';
import { sendMessage, sendVideoNote, answerCallbackQuery } from './services/telegram.js';
import { STATES } from './utils/states.js';

// Импортируем обработчики
import { handleSalesFlow } from './handlers/sales.js';
import { handleManagerFlow } from './handlers/manager.js';
import { handleAboutFlow } from './handlers/about.js';
import { handleServicesFlow } from './handlers/services.js';
import { handlePortfolioFlow } from './handlers/portfolio.js';
import { handleChatbotsOffer } from './handlers/offers/chatbots.js';
import { handleVoiceBotsOffer } from './handlers/offers/voice_bots.js';
import { handleAvatarsOffer } from './handlers/offers/avatars.js';
import { handleContentGenerationOffer } from './handlers/offers/content_generation.js';
import { handleAutomationOffer } from './handlers/offers/automation.js';
import { handleIntegrationOffer } from './handlers/offers/integration.js';
import { handleCustomDevelopmentOffer } from './handlers/offers/custom_development.js';
import { handleConsultationOffer } from './handlers/offers/consultation.js';
import { handleTutorBotExample } from './handlers/examples/tutor_bot.js';
import { handleVAPIBotExample } from './handlers/examples/vapi_bot.js';
import { handleVertexAIBotExample } from './handlers/examples/vertex_ai_bot.js';
import { handleDifyBotExample } from './handlers/examples/dify_bot.js';
import { handlePhotoAnimationExample } from './handlers/examples/photo_animation.js';
import { handleCorporateAssistantExample } from './handlers/examples/corporate_assistant.js';
import { handleVideoGenerationExample } from './handlers/examples/video_generation.js';
import { handleImageGenerationExample } from './handlers/examples/image_generation.js';
import { handleHeyGenAvatarExample } from './handlers/examples/heygen_avatar.js';
import { handleUnityAvatarExample } from './handlers/examples/unity_avatar.js';
import { handleAstrologyChatbotExample } from './handlers/examples/astrology_chatbot.js';
import { handleN8NAutomationExample } from './handlers/examples/n8n_automation.js';

// 1. ВОТ ТВОЙ ID ВИДЕО-КРУЖОЧКА
const WELCOME_VIDEO_ID = 'DQACAgIAAxkBAANHaW1Ag8kYEGZkSaBL_DApnvE8IAkAAvCTAAKzyWlL_bC7hUt2Fc04BA';

const WELCOME_MESSAGE = `<b>⚡️ Neuron_AI | Ваш AI-партнер в цифровой трансформации</b>

<b>Мы превращаем Искусственный Интеллект в реальные бизнес-результаты</b>

<b>Что мы создаем:</b>

<b>🤖 Умные боты</b>
- Чат-боты для мессенджеров и сайтов
- Голосовые ассистенты для автоматизации звонков
- Интеграция с Вашими системами

<b>🎭 3D-аватары с AI</b>
- Виртуальные консультанты
- AI-презентеры для видео
- Цифровые сотрудники

<b>⚙️ Бизнес-автоматизация</b>
- Оптимизация процессов с помощью ИИ
- Интеграция систем и сервисов
- Снижение операционных расходов

<b>🎨 Генерация контента</b>
- AI-видео для маркетинга
- Креативы и изображения
- Автоматизация контент-производства

<b>🧠 Разработка уникальных решений под Ваши задачи</b>
- Внедрение AI в CRM системы
- Обучение моделей AI и установка в закрытый контур
- Сопровождение AI проектов

<b>12+ лет опыта в IT• 50+ AI проектов • Техподдержка</b>

<b>👇 Начнем создавать AI решения?</b>`;

const MAIN_KEYBOARD = {
  inline_keyboard: [
    [
      { text: '📋 О компании', callback_data: 'about' },
      { text: '🛠️ Наши услуги', callback_data: 'services' }
    ],
    [
      { text: '🎨 Портфолио', callback_data: 'portfolio' },
      { text: '🤖 AI Консультант', callback_data: 'ai_consultant' }
    ],
    [
      { text: '👨‍💼 Связаться с менеджером', callback_data: 'manager' }
    ],
    [
      { text: '📞 Контакты', callback_data: 'contacts' }
    ]
  ]
};

// --- РАБОТА С KV (БАЗОЙ ДАННЫХ) С ЗАЩИТОЙ ---

async function saveUserData(chatId, data, env) {
  if (!env.NEURON_KV) {
    // console.log('⚠️ NEURON_KV не подключена. Данные не сохранены.');
    return;
  }
  
  const key = `user:${chatId}`;
  const userData = await env.NEURON_KV.get(key, 'json') || {};
  const updated = {
    ...userData,
    ...data,
    lastUpdated: new Date().toISOString()
  };
  await env.NEURON_KV.put(key, JSON.stringify(updated));
}

async function getUserData(chatId, env) {
  if (!env.NEURON_KV) return { chatId, interactions: 0 }; 

  const key = `user:${chatId}`;
  return await env.NEURON_KV.get(key, 'json') || {
    chatId,
    created: new Date().toISOString(),
    interactions: 0
  };
}

async function saveInteraction(chatId, action, env) {
  if (!env.NEURON_KV) return;

  const historyKey = `history:${chatId}`;
  const history = await env.NEURON_KV.get(historyKey, 'json') || [];
  
  history.push({
    action,
    timestamp: new Date().toISOString()
  });

  const limited = history.slice(-100);
  await env.NEURON_KV.put(historyKey, JSON.stringify(limited));
}

// --- ОБРАБОТЧИК ---

async function handleUpdate(update, env) {
  const message = update.message;
  const callback = update.callback_query;

  // 1. Если это КНОПКА (Callback)
  if (callback) {
    const chatId = callback.message.chat.id;
    const data = callback.data;
    const user = callback.from;

    try {
      await saveUserToDb(user, env);
    } catch (e) {
      console.error("DB Save Error", e);
    }

    try {
      await saveInteraction(chatId, data, env);
      const currentData = await getUserData(chatId, env);
      await saveUserData(chatId, {
        lastAction: data,
        interactions: (currentData.interactions || 0) + 1
      }, env);
    } catch (e) {
      console.error('Ошибка сохранения KV:', e);
    }

    // Отвечаем на колбек
    await answerCallbackQuery(callback.id, env);

    // Обработка кнопок меню
    switch (data) {
      case 'about':
        return handleAboutFlow(chatId, 'about', env, user);
      case 'contact_manager':
        return handleAboutFlow(chatId, 'contact_manager', env, user);
      case 'services':
        return handleServicesFlow(chatId, env);
      case 'portfolio':
        return handlePortfolioFlow(chatId, env);
      case 'ai_consultant':
        // Запускаем AI калькулятор стоимости
        await env.NEURON_KV?.put(`user_state:${chatId}`, JSON.stringify({ step: STATES.IDLE, salesData: {} }));
        return handleSalesFlow(chatId, '', { step: STATES.IDLE }, env);
      case 'manager':
        // Запускаем связь с менеджером
        await env.NEURON_KV?.put(`user_state:${chatId}`, JSON.stringify({ step: STATES.IDLE, data: {} }));
        return handleManagerFlow(chatId, { message: { text: '', from: user } }, { step: STATES.IDLE }, env);
      case 'contacts':
        return handleContacts(chatId, env);
      case 'offer_chatbots':
        return handleChatbotsOffer(chatId, env);
      case 'offer_voice_bots':
        return handleVoiceBotsOffer(chatId, env);
      case 'offer_avatars':
        return handleAvatarsOffer(chatId, env);
      case 'offer_content_generation':
        return handleContentGenerationOffer(chatId, env);
      case 'offer_automation':
        return handleAutomationOffer(chatId, env);
      case 'offer_integration':
        return handleIntegrationOffer(chatId, env);
      case 'offer_custom_development':
        return handleCustomDevelopmentOffer(chatId, env);
      case 'offer_consultation':
        return handleConsultationOffer(chatId, env);
      case 'example_tutor_bot':
        return handleTutorBotExample(chatId, env);
      case 'example_vapi_bot':
        return handleVAPIBotExample(chatId, env);
      case 'example_vertex_ai_bot':
        return handleVertexAIBotExample(chatId, env);
      case 'example_dify_bot':
        return handleDifyBotExample(chatId, env);
      case 'example_photo_animation':
        return handlePhotoAnimationExample(chatId, env);
      case 'example_corporate_assistant':
        return handleCorporateAssistantExample(chatId, env);
      case 'example_video_generation':
        return handleVideoGenerationExample(chatId, env);
      case 'example_image_generation':
        return handleImageGenerationExample(chatId, env);
      case 'example_heygen_avatar':
        return handleHeyGenAvatarExample(chatId, env);
      case 'example_unity_avatar':
        return handleUnityAvatarExample(chatId, env);
      case 'example_astrology_chatbot':
        return handleAstrologyChatbotExample(chatId, env);
      case 'example_n8n_automation':
        return handleN8NAutomationExample(chatId, env);
      case 'back':
        // Очищаем состояние при возврате в меню
        await env.NEURON_KV?.delete(`user_state:${chatId}`);
        return sendMessage(chatId, WELCOME_MESSAGE, env, MAIN_KEYBOARD);
      default:
        return sendMessage(chatId, 'Неизвестная команда', env);
    }
  }

  // 2. Если это СООБЩЕНИЕ (Текст, Фото, Контакт)
  if (message) {
    const chatId = message.chat.id;
    const text = message.text;
    const user = message.from;

    try {
      await saveUserToDb(user, env);
    } catch (e) {
      console.error("DB Save Error", e);
    }

    try {
      await saveUserData(chatId, {
        username: user.username,
        firstName: user.first_name
      }, env);
    } catch (e) {
      console.error('Ошибка сохранения UserData:', e);
    }

    // Получаем текущее состояние пользователя из KV
    let userState = { step: STATES.IDLE, salesData: {} };
    if (env.NEURON_KV) {
      userState = await env.NEURON_KV.get(`user_state:${chatId}`, 'json') || userState;
    }

    // A. Команда /start - всегда сбрасывает всё
    if (text === '/start') {
      try {
        await saveInteraction(chatId, 'start', env);
      } catch (e) {}
      
      await env.NEURON_KV?.delete(`user_state:${chatId}`); // Очистка памяти
      
      // Отправляем видео перед текстом
      try {
        const videoResult = await sendVideoNote(chatId, WELCOME_VIDEO_ID, env);
        console.log('✅ Видео отправлено:', videoResult);
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (e) {
        console.error("❌ Ошибка отправки видео:", JSON.stringify(e, null, 2));
      }
      
      return sendMessage(chatId, WELCOME_MESSAGE, env, MAIN_KEYBOARD);
    }

    // A2. Команда /manager - запускает обработчик менеджера
    if (text === '/manager') {
      try {
        await saveInteraction(chatId, 'manager', env);
      } catch (e) {}
      
      await env.NEURON_KV?.put(`user_state:${chatId}`, JSON.stringify({ step: STATES.IDLE, data: {} }));
      return handleManagerFlow(chatId, { message: { text: '', from: user } }, { step: STATES.IDLE }, env);
    }

    // B. Если нажали "Вернуться в меню" или "Отмена"
    if (text === "❌ Вернуться в меню" || text === "❌ Отмена") {
      await env.NEURON_KV?.delete(`user_state:${chatId}`);
      return sendMessage(chatId, WELCOME_MESSAGE, env, MAIN_KEYBOARD);
    }

    // C. Если мы ВНУТРИ ВОРОНКИ ПРОДАЖ (Шаг начинается с 'sales_')
    if (userState.step && userState.step.toString().includes('sales_')) {
      // Если пришел контакт через кнопку
      const content = message.contact
        ? `${message.contact.phone_number} (${message.contact.first_name})`
        : text;

      return handleSalesFlow(chatId, content, userState, env, user);
    }

    // D. Если мы В РЕЖИМЕ МЕНЕДЖЕРА
    if (userState.step === STATES.MANAGER_WAIT) {
      return handleManagerFlow(chatId, update, userState, env);
    }

    // E. Если ничего не подошло
    return sendMessage(chatId, "Используйте меню 👇", env, MAIN_KEYBOARD);
  }
}

// --- HANDLERS ---

async function handleContacts(chatId, env) {
  return sendMessage(chatId, '📞 <b>Контакты:</b>\n\nТелефон: +7 (999) 000-00-00\nEmail: info@neuronai.com', env, { inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'back' }]] });
}

// --- ENTRY POINT ---

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'POST') {
      try {
        const update = await request.json();

        if (update.message?.from) {
            ctx.waitUntil(saveUserToDb(update.message.from, env));
        } else if (update.callback_query?.from) {
            ctx.waitUntil(saveUserToDb(update.callback_query.from, env));
        }

        await handleUpdate(update, env);
        
        return new Response('ok', { status: 200 });
      } catch (error) {
        console.error('Error:', error);
        return new Response('error', { status: 500 });
      }
    }
    return new Response('Bot active', { status: 200 });
  }
};