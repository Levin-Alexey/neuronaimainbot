// src/handlers/sales.js
import { sendMessage } from '../services/telegram.js';
import { STATES } from '../utils/states.js';

const N8N_WEBHOOK_URL = "https://levinbiz.app.n8n.cloud/webhook/sales-manager"; // Твой вебхук

// Клавиатура отмены
const CANCEL_KB = {
  keyboard: [[{ text: "❌ Отмена" }]],
  resize_keyboard: true
};

/**
 * Главный обработчик воронки продаж
 */
export async function handleSalesFlow(chatId, text, userState, env, user = null) {
  
  // 0. Если нажали "Отмена"
  if (text === "❌ Отмена") {
    await saveState(chatId, STATES.IDLE, {}, env);
    return sendMessage(chatId, "Расчет отменен.", env, { remove_keyboard: true });
  }

  const step = userState.step || STATES.IDLE;
  const data = userState.salesData || {};

  // --- ЛОГИКА ПО ШАГАМ ---

  switch (step) {
    // ШАГ 1: Только зашли, спрашиваем Нишу
    case STATES.IDLE: 
      await saveState(chatId, STATES.SALES_NICHE, {}, env);
      return sendMessage(chatId, 
        "💼 <b>AI-Калькулятор стоимости</b>\n\nЯ обучена на актуальных прайс-листах Neuron_AI.\n\n1️⃣ <b>Какая у Вас сфера бизнеса?</b>", 
        env, CANCEL_KB
      );

    // ШАГ 2: Получили Нишу -> Спрашиваем Задачу
    case STATES.SALES_NICHE:
      data.niche = text;
      await saveState(chatId, STATES.SALES_TASK, data, env);
      return sendMessage(chatId, 
        "2️⃣ <b>Опишите задачу своими словами.</b>\nНапример: 'Хочу бота, который отвечает на вопросы по PDF и записывает на прием'", 
        env, CANCEL_KB
      );

    // ШАГ 3: Получили Задачу -> Спрашиваем Бюджет
    case STATES.SALES_TASK:
      data.task = text;
      await saveState(chatId, STATES.SALES_BUDGET, data, env);
      return sendMessage(chatId, "3️⃣ <b>На какой бюджет Вы ориентируетесь?</b>", env, {
        keyboard: [
          [{ text: "до 50 000 руб" }, { text: "50-150 тыс. руб" }],
          [{ text: "150-300 тыс. руб" }, { text: "Бюджет не ограничен" }],
          [{ text: "❌ Отмена" }]
        ],
        resize_keyboard: true
      });

    // ШАГ 4: Получили Бюджет -> Спрашиваем Контакт
    case STATES.SALES_BUDGET:
      data.budget = text;
      await saveState(chatId, STATES.SALES_CONTACT, data, env);
      return sendMessage(chatId, 
        "4️⃣ <b>Как с Вами связаться?</b>\nНапишите телефон или @username.", 
        env, {
          keyboard: [
            [{ text: "📱 Отправить мой контакт", request_contact: true }],
            [{ text: "❌ Отмена" }]
          ],
          resize_keyboard: true
        }
      );

    // ШАГ 5: ФИНАЛ -> Отправляем в n8n
    case STATES.SALES_CONTACT:
      // Контакт может быть текстом или объектом контакта
      let contactInfo = text;
      // Если пришел объект контакта (через кнопку) - он обрабатывается в index.js и передается сюда как текст, 
      // либо можно передать объект user. Мы упростим и возьмем text.

      data.contact = contactInfo;
      data.username = user?.username || "Нет юзернейма";

      // 1. Шлем "печатает..."
      await sendMessage(chatId, "⏳ AI анализирует задачу и считает смету...", env, { remove_keyboard: true });

      // 2. Отправляем в N8N
      try {
        const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await n8nResponse.json();
        const answer = result.answer || "Спасибо! Мы получили заявку.";

        // 3. Сбрасываем состояние
        await saveState(chatId, STATES.IDLE, {}, env);

        // 4. Отдаем ответ
        return sendMessage(chatId, `📝 <b>Ваше предварительное КП:</b>\n\n${answer}\n\n✅ Запрос передан руководителю.`, env);

      } catch (e) {
        console.error("N8N Error", e);
        await saveState(chatId, STATES.IDLE, {}, env);
        return sendMessage(chatId, "❌ Ошибка соединения с сервером расчета. Данные сохранены, менеджер свяжется вручную.", env);
      }

    default:
      return sendMessage(chatId, "Ошибка состояния. Нажмите /start", env);
  }
}

// Помощник для сохранения состояния в KV
async function saveState(chatId, step, data, env) {
  if (!env.NEURON_KV) return;
  const key = `user_state:${chatId}`;
  await env.NEURON_KV.put(key, JSON.stringify({ step, salesData: data }));
}