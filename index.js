/**
 * Neuron AI - Telegram Bot on Cloudflare Workers
 */
import { saveUserToDb } from './services/supabase.js';

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
  // 1. Обработка текстовых сообщений
  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text;
    const user = update.message.from;

    try {
        await saveUserToDb(user, env); 
    } catch (e) {
        console.error("DB Save Error", e);
    }

    try {
        await saveUserData(chatId, {
            username: update.message.from.username,
            firstName: update.message.from.first_name
        }, env);
    } catch (e) { console.error('Ошибка сохранения UserData:', e); }

    if (text === '/start') {
      try { await saveInteraction(chatId, 'start', env); } catch(e) {}
      
      // --- НОВОЕ: ОТПРАВЛЯЕМ ВИДЕО ПЕРЕД ТЕКСТОМ ---
      try {
          const videoResult = await sendVideoNote(chatId, WELCOME_VIDEO_ID, env);
          console.log('✅ Видео отправлено:', videoResult);
          
          // Задержка для гарантии порядка
          await new Promise(resolve => setTimeout(resolve, 800));
      } catch (e) {
          console.error("❌ Ошибка отправки видео:", JSON.stringify(e, null, 2));
          console.error("Stack:", e.stack);
      }
      
      return sendMessage(chatId, WELCOME_MESSAGE, env, MAIN_KEYBOARD);
    }
  }

  // 2. Обработка кнопок
  if (update.callback_query) {
    const callbackId = update.callback_query.id;
    const chatId = update.callback_query.message.chat.id; 
    const data = update.callback_query.data;
    const user = update.callback_query.from;

    try {
        await saveUserToDb(user, env);
    } catch (e) {}

    try {
        await saveInteraction(chatId, data, env);
        const currentData = await getUserData(chatId, env);
        await saveUserData(chatId, {
            lastAction: data,
            interactions: (currentData.interactions || 0) + 1
        }, env);
    } catch (e) { console.error('Ошибка сохранения KV:', e); }

    await answerCallbackQuery(callbackId, env);

    switch (data) {
      case 'about': return handleAbout(chatId, env);
      case 'services': return handleServices(chatId, env);
      case 'portfolio': return handlePortfolio(chatId, env);
      case 'ai_consultant': return handleAIConsultant(chatId, env);
      case 'manager': return handleManager(chatId, env);
      case 'contacts': return handleContacts(chatId, env);
      case 'back': return sendMessage(chatId, WELCOME_MESSAGE, env, MAIN_KEYBOARD);
      default: return sendMessage(chatId, 'Неизвестная команда', env);
    }
  }
}

// --- API TELEGRAM ---

async function sendMessage(chatId, text, env, keyboard = null) {
  const token = env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_TOKEN; 
  if (!token) throw new Error("Токен бота не найден в переменных!");

  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };

  if (keyboard) {
    payload.reply_markup = keyboard;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return response.json();
}

// 2. НОВАЯ ФУНКЦИЯ ДЛЯ ВИДЕО-КРУЖОЧКОВ
async function sendVideoNote(chatId, videoFileId, env) {
  const token = env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_TOKEN;
  
  const url = `https://api.telegram.org/bot${token}/sendVideoNote`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      video_note: videoFileId
    })
  });
  
  const result = await response.json();
  
  if (!result.ok) {
    console.error('Telegram API Error:', result);
    throw new Error(`Telegram API: ${result.description || 'Unknown error'}`);
  }
  
  return result;
}

async function answerCallbackQuery(callbackId, env) {
  const token = env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_TOKEN;
  return fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackId })
  });
}

// --- HANDLERS ---

async function handleAbout(chatId, env) {
  return sendMessage(chatId, 'ℹ️ <b>О компании Neuron AI</b>\n\nМы — команда энтузиастов и инженеров...', env, { inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'back' }]] });
}

async function handleServices(chatId, env) {
  return sendMessage(chatId, '🛠️ <b>Наши услуги:</b>\n\n1. Внедрение LLM\n2. Чат-боты\n3. Аналитика данных', env, { inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'back' }]] });
}

async function handlePortfolio(chatId, env) {
  return sendMessage(chatId, '🎨 <b>Наше портфолио:</b>\n\nКейс 1: Бот для риелторов\nКейс 2: Анализ звонков', env, { inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'back' }]] });
}

async function handleAIConsultant(chatId, env) {
  return sendMessage(chatId, '🤖 <b>AI Консультант</b>\n\nНапишите свой вопрос, и нейросеть ответит вам (функция в разработке).', env, { inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'back' }]] });
}

async function handleManager(chatId, env) {
  return sendMessage(chatId, '👨‍💼 <b>Связь с менеджером</b>\n\nЗаявка отправлена. Ожидайте ответа.', env, { inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'back' }]] });
}

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