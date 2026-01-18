import { createClient } from '@supabase/supabase-js';

// Функция инициализации (чтобы не создавать клиент 100 раз)
const getSupabase = (env) => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
};

/**
 * Сохраняет или обновляет пользователя
 * @param {Object} telegramUser - объект user из Telegram (msg.from)
 * @param {Object} env - переменные окружения
 */
export async function saveUserToDb(telegramUser, env) {
  const supabase = getSupabase(env);

  const { data, error } = await supabase
    .from('users')
    .upsert({
      telegram_id: telegramUser.id,
      username: telegramUser.username || null,
      first_name: telegramUser.first_name || null,
      last_name: telegramUser.last_name || null,
      updated_at: new Date().toISOString() 
      // created_at мы НЕ передаем, Supabase сам поставит его при первом создании
    }, { onConflict: 'telegram_id' }) // Если ID совпадает -> обновить
    .select();

  if (error) {
    console.error('Ошибка записи в Supabase:', error);
  } else {
    // console.log('Пользователь обновлен:', data); // Можно раскомментировать для отладки
  }
}