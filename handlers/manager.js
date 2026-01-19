// src/handlers/manager.js
import { sendMessage } from '../services/telegram.js';
import { STATES } from '../utils/states.js';

// ТВОЙ ID ДЛЯ ПОЛУЧЕНИЯ СООБЩЕНИЙ
const MANAGER_CHAT_ID = 525944420; 

export async function handleManagerFlow(chatId, update, userState, env) {
  const message = update.message;
  const text = message.text;

  // 0. Отмена
  if (text === "❌ Отмена") {
    await clearState(chatId, env);
    return sendMessage(chatId, "Связь отменена.", env, { remove_keyboard: true });
  }

  // 1. Если только нажали кнопку "Связаться" (состояние IDLE или только перешли)
  if (!userState.step || userState.step === STATES.IDLE) {
    await setState(chatId, STATES.MANAGER_WAIT, env);
    return sendMessage(chatId, 
      "📞 <b>Связь с менеджером</b>\n\nНапишите сообщение, отправьте фото или файл.", 
      env, 
      { keyboard: [[{ text: "❌ Отмена" }]], resize_keyboard: true }
    );
  }

  // 2. Если мы уже ждем сообщение (STATE === MANAGER_WAIT)
  if (userState.step === STATES.MANAGER_WAIT) {
    
    // Формируем шапку сообщения для тебя
    const userInfo = `📩 <b>Новое сообщение!</b>\nFrom: ${message.from.first_name} (@${message.from.username})\nID: ${chatId}`;

    try {
      // А. Если ТЕКСТ
      if (text) {
        await sendMessage(MANAGER_CHAT_ID, `${userInfo}\n\n${text}`, env);
      }
      
      // Б. Если ФОТО, ДОКУМЕНТ или ВИДЕО
      // В Cloudflare сложнее пересылать файлы "как есть" без скачивания.
      // Самый простой способ - использовать метод copyMessage (копирует сообщение целиком)
      else {
        await sendMessage(MANAGER_CHAT_ID, userInfo, env); // Сначала инфо кто пишет
        await copyMessageToManager(MANAGER_CHAT_ID, chatId, message.message_id, env);
      }

      await sendMessage(chatId, "✅ Сообщение отправлено менеджеру!", env, { remove_keyboard: true });
      await clearState(chatId, env); // Сбрасываем состояние

    } catch (e) {
      console.error(e);
      await sendMessage(chatId, "❌ Ошибка отправки.", env);
    }
  }
}

// Хелперы для KV
async function setState(chatId, step, env) {
  if (!env.NEURON_KV) return;
  await env.NEURON_KV.put(`user_state:${chatId}`, JSON.stringify({ step, salesData: {} }));
}

async function clearState(chatId, env) {
  if (!env.NEURON_KV) return;
  await env.NEURON_KV.delete(`user_state:${chatId}`);
}

// Функция копирования сообщения (Нативная фишка Телеграма)
async function copyMessageToManager(targetChatId, fromChatId, messageId, env) {
  const token = env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_TOKEN;
  await fetch(`https://api.telegram.org/bot${token}/copyMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: targetChatId,
      from_chat_id: fromChatId,
      message_id: messageId
    })
  });
}