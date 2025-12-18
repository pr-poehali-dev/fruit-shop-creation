'''
Business: Чат поддержки с ботом Анфисой и администраторами
Args: event с httpMethod, body, queryStringParameters; context с request_id
Returns: HTTP response с данными чата и сообщениями
'''

import json
import os
import psycopg2
import time
import urllib.request
import urllib.parse
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional

_faq_cache = None
_faq_cache_time = 0

def clear_faq_cache():
    global _faq_cache, _faq_cache_time
    _faq_cache = None
    _faq_cache_time = 0

def check_inactive_chats(cur, conn):
    """
    Проверяет чаты на неактивность администратора (30+ минут)
    Возвращает к Анфисе и помечает как пропущенные
    """
    try:
        # Находим чаты в статусе 'active' где последнее сообщение от админа было >30 мин назад
        cur.execute("""
            SELECT DISTINCT c.id, c.admin_name, c.user_id, c.guest_id
            FROM t_p77282076_fruit_shop_creation.support_chats c
            WHERE c.status = 'active'
            AND c.updated_at < NOW() - INTERVAL '30 minutes'
            AND EXISTS (
                SELECT 1 FROM t_p77282076_fruit_shop_creation.support_messages m
                WHERE m.chat_id = c.id
                AND m.sender_type = 'user'
                AND m.created_at > (
                    SELECT COALESCE(MAX(created_at), '1970-01-01'::timestamp)
                    FROM t_p77282076_fruit_shop_creation.support_messages
                    WHERE chat_id = c.id AND sender_type = 'admin'
                )
            )
        """)
        
        inactive_chats = cur.fetchall()
        
        for chat_id, admin_name, user_id, guest_id in inactive_chats:
            # Возвращаем к Анфисе
            cur.execute(
                "UPDATE t_p77282076_fruit_shop_creation.support_chats SET status = 'bot', admin_id = NULL, admin_name = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                (chat_id,)
            )
            
            # Добавляем сообщение от Анфисы
            cur.execute(
                "INSERT INTO t_p77282076_fruit_shop_creation.support_messages (chat_id, sender_type, sender_name, message, is_read, ticket_id) VALUES (%s, 'bot', 'Анфиса', %s, true, 1)",
                (chat_id, f'Администратор {admin_name} долго не отвечал, поэтому я снова с вами! 😊 Чем могу помочь?')
            )
            
            # Помечаем в архиве как пропущенный (добавляем запись)
            is_guest = guest_id is not None
            if is_guest:
                user_name = "Гость"
                user_phone = None
            elif user_id:
                cur.execute(
                    "SELECT full_name, phone FROM t_p77282076_fruit_shop_creation.users WHERE id = %s",
                    (user_id,)
                )
                user_data = cur.fetchone()
                user_name = user_data[0] if user_data else "Пользователь"
                user_phone = user_data[1] if user_data else None
            else:
                user_name = "Гость"
                user_phone = None
            
            # Получаем все сообщения для архива
            cur.execute(
                "SELECT sender_type, sender_name, message, created_at FROM t_p77282076_fruit_shop_creation.support_messages WHERE chat_id = %s ORDER BY created_at ASC",
                (chat_id,)
            )
            messages = []
            for msg in cur.fetchall():
                messages.append({
                    'sender_type': msg[0],
                    'sender_name': msg[1],
                    'message': msg[2],
                    'created_at': msg[3].isoformat() if msg[3] else None
                })
            
            # Сохраняем в архив как пропущенный
            cur.execute(
                """INSERT INTO t_p77282076_fruit_shop_creation.archived_chats 
                (chat_id, user_id, user_name, user_phone, admin_id, admin_name, status, messages_json, is_guest, guest_id, is_missed)
                VALUES (%s, %s, %s, %s, NULL, %s, 'missed', %s, %s, %s, true)""",
                (chat_id, user_id, user_name, user_phone, admin_name, json.dumps(messages, ensure_ascii=False), is_guest, guest_id)
            )
            
            conn.commit()
            
            # Уведомляем админа
            telegram_msg = f"⚠️ <b>Пропущенный чат #{chat_id}</b>\n\n👤 Пользователь: {user_name}\n👨‍💼 Админ: {admin_name}\n💬 Чат возвращен к Анфисе из-за неактивности (30+ мин)"
            send_telegram_notification(telegram_msg)
        
        return len(inactive_chats)
    except Exception as e:
        print(f"Check inactive chats error: {e}")
        return 0

def send_telegram_notification(message: str):
    try:
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        chat_id = os.environ.get('ADMIN_TELEGRAM_CHAT_ID')
        
        if not bot_token or not chat_id:
            return
        
        url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
        data = urllib.parse.urlencode({
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'HTML'
        }).encode()
        
        req = urllib.request.Request(url, data=data)
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass

def is_working_hours() -> bool:
    """Проверяет рабочее время: 6:00-19:00 МСК (UTC+3)"""
    # Московское время (UTC+3)
    moscow_tz = timezone(timedelta(hours=3))
    now_moscow = datetime.now(moscow_tz)
    current_hour = now_moscow.hour
    
    # Для отладки
    import sys
    print(f"[DEBUG] Current Moscow time: {now_moscow.isoformat()}, hour: {current_hour}, working: {6 <= current_hour < 19}", file=sys.stderr, flush=True)
    
    return 6 <= current_hour < 19

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    return conn

def execute_with_retry(cur, query, params=None, max_retries=2):
    for attempt in range(max_retries):
        try:
            if params:
                cur.execute(query, params)
            else:
                cur.execute(query)
            return
        except psycopg2.OperationalError as e:
            if 'rate limit' in str(e) and attempt < max_retries - 1:
                time.sleep(0.5 * (attempt + 1))
                continue
            raise

def get_faqs_cached(cur) -> List:
    global _faq_cache, _faq_cache_time
    import time
    
    current_time = time.time()
    if _faq_cache is None or (current_time - _faq_cache_time) > 300:
        cur.execute(
            "SELECT id, question, answer, keywords FROM t_p77282076_fruit_shop_creation.faq WHERE is_active = true"
        )
        _faq_cache = cur.fetchall()
        _faq_cache_time = current_time
    
    return _faq_cache

def search_faq(question: str, cur, conversation_history: List[Dict[str, str]] = None) -> Optional[Dict[str, Any]]:
    question_lower = question.lower().strip()
    
    faqs = get_faqs_cached(cur)
    
    best_match = None
    best_score = 0
    all_matches = []
    
    for faq in faqs:
        faq_id, faq_question, faq_answer, keywords = faq
        score = 0
        
        if keywords:
            for keyword in keywords:
                keyword_lower = keyword.lower().strip()
                if keyword_lower in question_lower:
                    score += 5
        
        question_words = faq_question.lower().split()
        for word in question_words:
            word_clean = word.strip('?!.,;:')
            if len(word_clean) > 3 and word_clean in question_lower:
                score += 2
        
        user_words = question_lower.split()
        for word in user_words:
            word_clean = word.strip('?!.,;:')
            if len(word_clean) > 3 and word_clean in faq_question.lower():
                score += 2
        
        if score > 0:
            all_matches.append({
                'id': faq_id,
                'question': faq_question,
                'answer': faq_answer,
                'score': score
            })
        
        if score > best_score:
            best_score = score
            best_match = {
                'id': faq_id,
                'question': faq_question,
                'answer': faq_answer,
                'score': score
            }
    
    if best_score >= 8:
        return best_match
    
    if best_score >= 3 and len(all_matches) == 1:
        return best_match
    
    if 3 <= best_score < 8 and len(all_matches) > 1:
        all_matches.sort(key=lambda x: x['score'], reverse=True)
        top_matches = [m for m in all_matches if m['score'] >= 3][:3]
        
        clarification = "Я нашла несколько похожих вопросов. Уточните, пожалуйста, что именно вас интересует:\n\n"
        for i, match in enumerate(top_matches, 1):
            clarification += f"{i}. {match['question']}\n"
        
        return {
            'id': 0,
            'question': '',
            'answer': clarification,
            'is_clarification': True,
            'options': top_matches
        }
    
    return None

def get_ai_response(question: str, conversation_history: List[Dict[str, str]] = None, faqs: List = None) -> Optional[str]:
    """
    Умный AI-ассистент Анфиса (встроенная версия с Groq/OpenAI)
    """
    try:
        import urllib.request
        import json
        
        # Проверяем наличие ключей
        api_key = os.environ.get('GROQ_API_KEY') or os.environ.get('OPENAI_API_KEY')
        if not api_key:
            return generate_fallback_response(question)
        
        # Определяем API
        if api_key.startswith('gsk_'):
            api_url = 'https://api.groq.com/openai/v1/chat/completions'
            model = 'llama-3.3-70b-versatile'
        else:
            api_url = 'https://api.openai.com/v1/chat/completions'
            model = 'gpt-4o-mini'
        
        # Системный промпт
        system_prompt = """Ты — Анфиса, дружелюбный AI-ассистент флорариума "Сибирская флора". 

ТВОЯ РОЛЬ:
- Помогай клиентам выбрать растения и флорариумы
- Консультируй по уходу за растениями
- Отвечай на вопросы о доставке, оплате, режиме работы

ИНФОРМАЦИЯ О МАГАЗИНЕ:
- Режим работы: 6:00-19:00 МСК
- Доставка: по Красноярску 200₽ (бесплатно от 3000₽)
- Оплата: картой онлайн, наличными курьеру
- Специализация: флорариумы, суккуленты, кактусы, орхидеи

СОВЕТЫ ПО УХОДУ:
- Флорариумы: полив раз в 2 недели, без прямых солнечных лучей
- Суккуленты: полив раз в неделю, любят свет
- Орхидеи: полив 2 раза в неделю, опрыскивание
- Кактусы: полив раз в 10 дней, много света

ПРАВИЛА:
- Отвечай кратко (2-3 предложения)
- Используй эмодзи 🌿💚✨
- Если не знаешь точный ответ — предложи дождаться администратора
- При просьбе связаться с человеком — скажи что передашь администратору"""

        # Формируем сообщения
        messages = [{'role': 'system', 'content': system_prompt}]
        
        if conversation_history:
            for msg in conversation_history[-6:]:
                role = 'assistant' if msg.get('role') == 'bot' else 'user'
                messages.append({'role': role, 'content': msg.get('text', '')})
        
        messages.append({'role': 'user', 'content': question})
        
        # Запрос к API
        data = json.dumps({
            'model': model,
            'messages': messages,
            'temperature': 0.7,
            'max_tokens': 300
        }).encode()
        
        req = urllib.request.Request(
            api_url,
            data=data,
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
        )
        
        with urllib.request.urlopen(req, timeout=15) as response:
            result = json.loads(response.read().decode())
            return result['choices'][0]['message']['content'].strip()
            
    except Exception as e:
        print(f"AI error: {e}")
        return generate_fallback_response(question)

def generate_fallback_response(question: str) -> str:
    """Резервные ответы без AI"""
    q = question.lower()
    
    if any(w in q for w in ['доставка', 'привезти', 'курьер']):
        return "Доставка по Красноярску — 200₽, бесплатно от 3000₽! 🚚 Доставляем за 1-3 дня."
    
    if any(w in q for w in ['оплат', 'карт', 'налич']):
        return "Принимаем оплату картой онлайн и наличными курьеру! 💳"
    
    if any(w in q for w in ['уход', 'полив', 'ухаживать']):
        return "Флорариумы неприхотливы! 🌿 Поливать раз в 2 недели, избегать прямых солнечных лучей."
    
    if any(w in q for w in ['цена', 'сколько', 'стоимость']):
        return "Флорариумы от 800₽ до 5000₽. 💰 Сейчас уточню у администратора!"
    
    if any(w in q for w in ['режим', 'работаете', 'часы']):
        return "Работаем с 6:00 до 19:00 МСК! 🕐"
    
    return "Спасибо за вопрос! 🌿 Передам администратору (работаем 6:00-19:00 МСК)."

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Accept, Cache-Control, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            # Проверяем неактивные чаты при каждом GET запросе
            check_inactive_chats(cur, conn)
            
            params = event.get('queryStringParameters') or {}
            user_id = params.get('user_id')
            admin_view = params.get('admin_view') == 'true'
            faq_mode = params.get('faq') == 'true'
            
            if faq_mode:
                faq_id = params.get('id')
                
                if faq_id:
                    cur.execute(
                        "SELECT id, question, answer, keywords, is_active FROM t_p77282076_fruit_shop_creation.faq WHERE id = %s",
                        (int(faq_id),)
                    )
                    row = cur.fetchone()
                    if row:
                        result = {
                            'id': row[0],
                            'question': row[1],
                            'answer': row[2],
                            'keywords': row[3] or [],
                            'is_active': row[4]
                        }
                    else:
                        return {
                            'statusCode': 404,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'FAQ не найден'}),
                            'isBase64Encoded': False
                        }
                else:
                    cur.execute(
                        "SELECT id, question, answer, keywords, is_active FROM t_p77282076_fruit_shop_creation.faq ORDER BY created_at DESC"
                    )
                    rows = cur.fetchall()
                    result = [{
                        'id': row[0],
                        'question': row[1],
                        'answer': row[2],
                        'keywords': row[3] or [],
                        'is_active': row[4]
                    } for row in rows]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            if params.get('archive') == 'true':
                cur.execute("""
                    SELECT id, chat_id, user_name, user_phone, admin_name, closed_at, messages_json
                    FROM t_p77282076_fruit_shop_creation.archived_chats
                    ORDER BY closed_at DESC
                    LIMIT 100
                """)
                
                archived = [{
                    'id': row[0],
                    'chat_id': row[1],
                    'user_name': row[2],
                    'user_phone': row[3],
                    'admin_name': row[4],
                    'closed_at': row[5].isoformat() if row[5] else None,
                    'messages_json': row[6]
                } for row in cur.fetchall()]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(archived, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            if admin_view:
                cur.execute("""
                    SELECT c.id, c.user_id, c.status, c.admin_id, c.admin_name, c.created_at, c.updated_at,
                           u.phone, u.full_name, c.guest_id,
                           (SELECT COUNT(*) FROM t_p77282076_fruit_shop_creation.support_messages 
                            WHERE chat_id = c.id AND is_read = false AND sender_type = 'user') as unread_count
                    FROM t_p77282076_fruit_shop_creation.support_chats c
                    LEFT JOIN t_p77282076_fruit_shop_creation.users u ON c.user_id = u.id
                    WHERE c.status IN ('waiting', 'active')
                    ORDER BY c.updated_at DESC
                """)
                rows = cur.fetchall()
                
                chats = [{
                    'id': row[0],
                    'user_id': row[1],
                    'status': row[2],
                    'admin_id': row[3],
                    'admin_name': row[4],
                    'created_at': row[5].isoformat() if row[5] else None,
                    'updated_at': row[6].isoformat() if row[6] else None,
                    'user_phone': row[7],
                    'user_name': (row[8] if row[8] else (row[7] if row[7] else 'Пользователь')),
                    'is_guest': row[9] is not None,
                    'guest_id': row[9],
                    'unread_count': row[10]
                } for row in rows]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(chats, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id обязателен'}),
                    'isBase64Encoded': False
                }
            
            is_guest = params.get('is_guest') == 'true'
            
            if is_guest:
                cur.execute(
                    "SELECT id, status, admin_id, admin_name FROM t_p77282076_fruit_shop_creation.support_chats WHERE guest_id = %s AND status != 'closed' ORDER BY created_at DESC LIMIT 1",
                    (str(user_id),)
                )
            else:
                cur.execute(
                    "SELECT id, status, admin_id, admin_name FROM t_p77282076_fruit_shop_creation.support_chats WHERE user_id = %s AND status != 'closed' ORDER BY created_at DESC LIMIT 1",
                    (int(user_id),)
                )
            chat_row = cur.fetchone()
            
            if not chat_row:
                # Всегда начинаем с бота - он попытается помочь через FAQ/AI
                initial_status = 'bot'
                
                if is_guest:
                    cur.execute(
                        "INSERT INTO t_p77282076_fruit_shop_creation.support_chats (guest_id, status) VALUES (%s, %s) RETURNING id",
                        (str(user_id), initial_status)
                    )
                else:
                    cur.execute(
                        "INSERT INTO t_p77282076_fruit_shop_creation.support_chats (user_id, status) VALUES (%s, %s) RETURNING id",
                        (int(user_id), initial_status)
                    )
                conn.commit()
                chat_id = cur.fetchone()[0]
                
                greeting = 'Здравствуйте! Я Анфиса, бот-помощник. Чем могу помочь? 😊'
                
                cur.execute(
                    "INSERT INTO t_p77282076_fruit_shop_creation.support_messages (chat_id, sender_type, sender_name, message, is_read, ticket_id) VALUES (%s, 'bot', 'Анфиса', %s, true, 1)",
                    (chat_id, greeting)
                )
                conn.commit()
                
                chat_data = {
                    'id': chat_id,
                    'status': initial_status,
                    'admin_id': None,
                    'admin_name': None
                }
            else:
                chat_data = {
                    'id': chat_row[0],
                    'status': chat_row[1],
                    'admin_id': chat_row[2],
                    'admin_name': chat_row[3]
                }
            
            cur.execute("""
                UPDATE t_p77282076_fruit_shop_creation.support_messages
                SET is_read = true
                WHERE chat_id = %s AND sender_type = 'user' AND is_read = false
            """, (chat_data['id'],))
            conn.commit()
            
            cur.execute("""
                SELECT id, sender_type, sender_name, message, created_at, is_read, admin_avatar
                FROM t_p77282076_fruit_shop_creation.support_messages
                WHERE chat_id = %s
                ORDER BY created_at ASC
            """, (chat_data['id'],))
            
            messages = [{
                'id': row[0],
                'sender_type': row[1],
                'sender_name': row[2],
                'message': row[3],
                'created_at': row[4].isoformat() if row[4] else None,
                'is_read': row[5],
                'admin_avatar': row[6]
            } for row in cur.fetchall()]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'chat': chat_data, 'messages': messages}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'create_faq':
                question = body_data.get('question', '').strip()
                answer = body_data.get('answer', '').strip()
                keywords = body_data.get('keywords', [])
                
                if not question or not answer:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Вопрос и ответ обязательны'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "INSERT INTO t_p77282076_fruit_shop_creation.faq (question, answer, keywords) VALUES (%s, %s, %s) RETURNING id",
                    (question, answer, keywords)
                )
                conn.commit()
                new_id = cur.fetchone()[0]
                
                clear_faq_cache()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': new_id, 'message': 'FAQ создан'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'send_message':
                user_id = body_data.get('user_id')
                chat_id = body_data.get('chat_id')
                message = body_data.get('message', '').strip()
                is_guest = body_data.get('is_guest', False)
                
                if not message:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Сообщение не может быть пустым'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "SELECT status FROM t_p77282076_fruit_shop_creation.support_chats WHERE id = %s",
                    (int(chat_id),)
                )
                chat_status = cur.fetchone()[0]
                
                if is_guest:
                    user_name = 'Гость'
                    sender_id = None
                else:
                    cur.execute(
                        "SELECT full_name FROM t_p77282076_fruit_shop_creation.users WHERE id = %s",
                        (int(user_id),)
                    )
                    user_name = cur.fetchone()[0]
                    sender_id = int(user_id)
                
                cur.execute(
                    "INSERT INTO t_p77282076_fruit_shop_creation.support_messages (chat_id, sender_type, sender_id, sender_name, message, ticket_id) VALUES (%s, 'user', %s, %s, %s, 1) RETURNING id",
                    (int(chat_id), sender_id, user_name, message)
                )
                conn.commit()
                message_id = cur.fetchone()[0]
                
                if chat_status == 'bot':
                    # Проверяем запрос оператора ДО всего остального
                    message_lower = message.lower().strip()
                    operator_keywords = ['оператор', 'администратор', 'человек', 'живой', 'сотрудник', 'менеджер', 'нужен человек', 'хочу с человеком', 'нужен админ', 'позовите админ']
                    
                    if any(keyword in message_lower for keyword in operator_keywords):
                        # Пользователь явно просит оператора
                        if is_working_hours():
                            bot_response = 'Хорошо, сейчас переведу вас на администратора! ⏳ Пожалуйста, подождите немного...'
                            
                            cur.execute(
                                "INSERT INTO t_p77282076_fruit_shop_creation.support_messages (chat_id, sender_type, sender_name, message, is_read, ticket_id) VALUES (%s, 'bot', 'Анфиса', %s, true, 1) RETURNING id",
                                (int(chat_id), bot_response)
                            )
                            bot_message_id = cur.fetchone()[0]
                            
                            cur.execute(
                                "UPDATE t_p77282076_fruit_shop_creation.support_chats SET status = 'waiting', updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                                (int(chat_id),)
                            )
                            conn.commit()
                            
                            telegram_msg = f"🔔 <b>Запрос оператора!</b>\n\n👤 От: {user_name}\n💬 Сообщение: {message[:100]}{'...' if len(message) > 100 else ''}\n\n📱 Чат ID: {chat_id}"
                            send_telegram_notification(telegram_msg)
                            
                            return {
                                'statusCode': 200,
                                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                                'body': json.dumps({
                                    'message_id': message_id,
                                    'bot_message_id': bot_message_id,
                                    'bot_response': bot_response,
                                    'status_changed': 'waiting'
                                }, ensure_ascii=False),
                                'isBase64Encoded': False
                            }
                        else:
                            bot_response = 'Наши администраторы сейчас отдыхают (работаем с 6:00 до 19:00 МСК) 😴\n\nВы можете:\n• Оставить вопрос здесь — ответим в рабочее время\n• Я попробую помочь сама! Задайте вопрос.'
                            
                            cur.execute(
                                "INSERT INTO t_p77282076_fruit_shop_creation.support_messages (chat_id, sender_type, sender_name, message, is_read, ticket_id) VALUES (%s, 'bot', 'Анфиса', %s, true, 1) RETURNING id",
                                (int(chat_id), bot_response)
                            )
                            bot_message_id = cur.fetchone()[0]
                            conn.commit()
                            
                            return {
                                'statusCode': 200,
                                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                                'body': json.dumps({
                                    'message_id': message_id,
                                    'bot_message_id': bot_message_id,
                                    'bot_response': bot_response
                                }, ensure_ascii=False),
                                'isBase64Encoded': False
                            }
                    
                    # Если не запрос оператора, продолжаем обычную логику
                    cur.execute("""
                        SELECT sender_type, message 
                        FROM t_p77282076_fruit_shop_creation.support_messages 
                        WHERE chat_id = %s 
                        ORDER BY created_at DESC 
                        LIMIT 5
                    """, (int(chat_id),))
                    history_rows = cur.fetchall()
                    conversation_history = [{'sender': row[0], 'message': row[1]} for row in history_rows]
                    
                    faq_answer = search_faq(message, cur, conversation_history)
                    
                    if faq_answer:
                        cur.execute(
                            "INSERT INTO t_p77282076_fruit_shop_creation.support_messages (chat_id, sender_type, sender_name, message, is_read, ticket_id) VALUES (%s, 'bot', 'Анфиса', %s, true, 1) RETURNING id",
                            (int(chat_id), faq_answer['answer'])
                        )
                        bot_message_id = cur.fetchone()[0]
                        conn.commit()
                        bot_response = faq_answer['answer']
                    else:
                        # Пытаемся получить AI-ответ
                        faqs = get_faqs_cached(cur)
                        ai_response = get_ai_response(message, [{'role': h['sender'], 'text': h['message']} for h in conversation_history], faqs)
                        
                        if ai_response:
                            cur.execute(
                                "INSERT INTO t_p77282076_fruit_shop_creation.support_messages (chat_id, sender_type, sender_name, message, is_read, ticket_id) VALUES (%s, 'bot', 'Анфиса', %s, true, 1) RETURNING id",
                                (int(chat_id), ai_response)
                            )
                            bot_message_id = cur.fetchone()[0]
                            conn.commit()
                            bot_response = ai_response
                            
                            return {
                                'statusCode': 200,
                                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                                'body': json.dumps({
                                    'message_id': message_id,
                                    'bot_message_id': bot_message_id,
                                    'bot_response': bot_response
                                }, ensure_ascii=False),
                                'isBase64Encoded': False
                            }
                        
                        # Если FAQ и AI не сработали, считаем попытки
                        # Считаем только сообщения пользователя (не включая текущее)
                        cur.execute("""
                            SELECT COUNT(*) 
                            FROM t_p77282076_fruit_shop_creation.support_messages 
                            WHERE chat_id = %s AND sender_type = 'user'
                        """, (int(chat_id),))
                        user_message_count = cur.fetchone()[0]
                        
                        # Первые 2 неудачные попытки - просим переформулировать
                        if user_message_count <= 2:
                            bot_response = 'Не совсем поняла ваш вопрос 🤔 Попробуйте переформулировать или задать более конкретный вопрос. Например:\n• Как ухаживать за растениями?\n• Условия доставки?\n• Способы оплаты?\n\nИли напишите "нужен администратор", если хотите поговорить с человеком! 💚'
                            
                            cur.execute(
                                "INSERT INTO t_p77282076_fruit_shop_creation.support_messages (chat_id, sender_type, sender_name, message, is_read, ticket_id) VALUES (%s, 'bot', 'Анфиса', %s, true, 1) RETURNING id",
                                (int(chat_id), bot_response)
                            )
                            bot_message_id = cur.fetchone()[0]
                            conn.commit()
                            
                            return {
                                'statusCode': 200,
                                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                                'body': json.dumps({
                                    'message_id': message_id,
                                    'bot_message_id': bot_message_id,
                                    'bot_response': bot_response
                                }, ensure_ascii=False),
                                'isBase64Encoded': False
                            }
                        # 3-я и далее попытки - переводим на админа (если рабочее время)
                        else:
                            if not is_working_hours():
                                bot_response = 'Похоже, мне сложно помочь с вашим вопросом 😔 Наши специалисты сейчас не на месте (работаем с 6:00 до 19:00 МСК).\n\nВы можете:\n• Оставить вопрос здесь — ответим в рабочее время\n• Переформулировать вопрос, и я попробую снова помочь\n\nЯ рядом! 💚'
                                
                                cur.execute(
                                    "INSERT INTO t_p77282076_fruit_shop_creation.support_messages (chat_id, sender_type, sender_name, message, is_read, ticket_id) VALUES (%s, 'bot', 'Анфиса', %s, true, 1) RETURNING id",
                                    (int(chat_id), bot_response)
                                )
                                bot_message_id = cur.fetchone()[0]
                                conn.commit()
                                
                                return {
                                    'statusCode': 200,
                                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                                    'body': json.dumps({
                                        'message_id': message_id,
                                        'bot_message_id': bot_message_id,
                                        'bot_response': bot_response
                                    }, ensure_ascii=False),
                                    'isBase64Encoded': False
                                }
                            
                            # В рабочее время переводим на админа
                            bot_response = 'Вижу, что мне сложно помочь с вашим вопросом 😔 Сейчас переведу вас на администратора, который разберется детальнее! ⏳\n\nПожалуйста, подождите немного...'
                            
                            cur.execute(
                                "INSERT INTO t_p77282076_fruit_shop_creation.support_messages (chat_id, sender_type, sender_name, message, is_read, ticket_id) VALUES (%s, 'bot', 'Анфиса', %s, true, 1) RETURNING id",
                                (int(chat_id), bot_response)
                            )
                            bot_message_id = cur.fetchone()[0]
                            
                            cur.execute(
                                "UPDATE t_p77282076_fruit_shop_creation.support_chats SET status = 'waiting', updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                                (int(chat_id),)
                            )
                            conn.commit()
                            
                            telegram_msg = f"🔔 <b>Новое обращение в поддержку!</b>\n\n👤 От: {user_name}\n💬 Сообщение: {message[:100]}{'...' if len(message) > 100 else ''}\n\n📱 Чат ID: {chat_id}"
                            send_telegram_notification(telegram_msg)
                            
                            return {
                                'statusCode': 200,
                                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                                'body': json.dumps({
                                    'message_id': message_id,
                                    'bot_message_id': bot_message_id,
                                    'bot_response': bot_response,
                                    'status_changed': 'waiting'
                                }, ensure_ascii=False),
                                'isBase64Encoded': False
                            }
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'message_id': message_id,
                            'bot_message_id': bot_message_id,
                            'bot_response': bot_response
                        }, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                else:
                    cur.execute(
                        "UPDATE t_p77282076_fruit_shop_creation.support_chats SET updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                        (int(chat_id),)
                    )
                    conn.commit()
                    
                    if chat_status in ['waiting', 'active']:
                        telegram_msg = f"💬 <b>Новое сообщение в чате #{chat_id}</b>\n\n👤 От: {user_name}\n✉️ {message[:150]}{'...' if len(message) > 150 else ''}"
                        send_telegram_notification(telegram_msg)
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'message_id': message_id}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
            
            elif action == 'admin_message':
                chat_id = body_data.get('chat_id')
                admin_id = body_data.get('admin_id')
                message = body_data.get('message', '').strip()
                
                if not message:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Сообщение не может быть пустым'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "SELECT full_name, profile_picture_url FROM t_p77282076_fruit_shop_creation.users WHERE id = %s",
                    (int(admin_id),)
                )
                admin_data = cur.fetchone()
                admin_name = admin_data[0]
                admin_avatar = admin_data[1] if admin_data[1] else None
                
                cur.execute(
                    "INSERT INTO t_p77282076_fruit_shop_creation.support_messages (chat_id, sender_type, sender_id, sender_name, message, admin_avatar, is_read, ticket_id) VALUES (%s, 'admin', %s, %s, %s, %s, true, 1)",
                    (int(chat_id), int(admin_id), admin_name, message, admin_avatar)
                )
                
                cur.execute(
                    "UPDATE t_p77282076_fruit_shop_creation.support_chats SET updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                    (int(chat_id),)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Сообщение отправлено'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            elif action == 'take_chat':
                chat_id = body_data.get('chat_id')
                admin_id = body_data.get('admin_id')
                
                try:
                    execute_with_retry(
                        cur,
                        "SELECT full_name, profile_picture_url FROM t_p77282076_fruit_shop_creation.users WHERE id = %s",
                        (int(admin_id),)
                    )
                    admin_data = cur.fetchone()
                    admin_name = admin_data[0]
                    admin_avatar = admin_data[1] if admin_data[1] else None
                    
                    execute_with_retry(
                        cur,
                        "UPDATE t_p77282076_fruit_shop_creation.support_chats SET status = 'active', admin_id = %s, admin_name = %s, admin_avatar = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                        (int(admin_id), admin_name, admin_avatar, int(chat_id))
                    )
                    
                    execute_with_retry(
                        cur,
                        "INSERT INTO t_p77282076_fruit_shop_creation.support_messages (chat_id, sender_type, sender_name, message, admin_avatar, is_read, ticket_id) VALUES (%s, 'admin', %s, %s, %s, true, 1)",
                        (int(chat_id), admin_name, f'Здравствуйте! На связи {admin_name}. Чем могу помочь?', admin_avatar)
                    )
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'message': 'Чат взят в работу'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                except Exception as e:
                    conn.rollback()
                    return {
                        'statusCode': 500,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': f'Не удалось взять чат: {str(e)}'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
            
            elif action == 'mark_read':
                chat_id = body_data.get('chat_id')
                
                cur.execute(
                    "UPDATE t_p77282076_fruit_shop_creation.support_messages SET is_read = true WHERE chat_id = %s",
                    (int(chat_id),)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Сообщения отмечены как прочитанные'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            
            if 'faq_id' in body_data:
                faq_id = body_data.get('faq_id')
                question = body_data.get('question', '').strip()
                answer = body_data.get('answer', '').strip()
                keywords = body_data.get('keywords', [])
                is_active = body_data.get('is_active', True)
                
                cur.execute(
                    "UPDATE t_p77282076_fruit_shop_creation.faq SET question = %s, answer = %s, keywords = %s, is_active = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                    (question, answer, keywords, is_active, int(faq_id))
                )
                conn.commit()
                
                clear_faq_cache()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'FAQ обновлен'}),
                    'isBase64Encoded': False
                }
            else:
                chat_id = body_data.get('chat_id')
                status = body_data.get('status')
                
                if status not in ['bot', 'waiting', 'active', 'closed']:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный статус'}),
                        'isBase64Encoded': False
                    }
                
                if status == 'closed':
                    # Получаем информацию о чате
                    cur.execute(
                        "SELECT user_id, admin_id, admin_name, status, guest_id FROM t_p77282076_fruit_shop_creation.support_chats WHERE id = %s",
                        (int(chat_id),)
                    )
                    chat_info = cur.fetchone()
                    user_id, admin_id, admin_name, old_status, guest_id = chat_info
                    
                    # Добавляем системное сообщение о закрытии чата
                    if admin_name:
                        close_message = f'Чат закрыт администратором {admin_name}'
                    else:
                        close_message = 'Чат закрыт'
                    
                    cur.execute(
                        "INSERT INTO t_p77282076_fruit_shop_creation.support_messages (chat_id, sender_type, sender_name, message, is_read, ticket_id) VALUES (%s, 'admin', %s, %s, true, 1)",
                        (int(chat_id), admin_name or 'Система', close_message)
                    )
                    
                    # Получаем имя и телефон пользователя
                    is_guest = guest_id is not None
                    if is_guest or not user_id:
                        user_name = "Гость"
                        user_phone = None
                    else:
                        cur.execute(
                            "SELECT full_name, phone FROM t_p77282076_fruit_shop_creation.users WHERE id = %s",
                            (int(user_id),)
                        )
                        user_data = cur.fetchone()
                        user_name = user_data[0] if user_data else "Пользователь"
                        user_phone = user_data[1] if user_data else None
                    
                    # Получаем все сообщения чата
                    cur.execute(
                        "SELECT sender_type, sender_name, message, created_at FROM t_p77282076_fruit_shop_creation.support_messages WHERE chat_id = %s ORDER BY created_at ASC",
                        (int(chat_id),)
                    )
                    messages = []
                    for msg in cur.fetchall():
                        messages.append({
                            'sender_type': msg[0],
                            'sender_name': msg[1],
                            'message': msg[2],
                            'created_at': msg[3].isoformat() if msg[3] else None
                        })
                    
                    # Сохраняем в архив
                    cur.execute(
                        "INSERT INTO t_p77282076_fruit_shop_creation.archived_chats (chat_id, user_id, user_name, user_phone, admin_id, admin_name, status, messages_json, is_guest, guest_id) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                        (int(chat_id), user_id, user_name, user_phone, admin_id, admin_name, old_status, json.dumps(messages, ensure_ascii=False), is_guest, guest_id)
                    )
                    
                    # Закрываем чат
                    cur.execute(
                        "UPDATE t_p77282076_fruit_shop_creation.support_chats SET status = %s, closed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                        (status, int(chat_id))
                    )
                else:
                    cur.execute(
                        "UPDATE t_p77282076_fruit_shop_creation.support_chats SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                        (status, int(chat_id))
                    )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Статус обновлен'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            faq_id = body_data.get('faq_id')
            
            if not faq_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID FAQ обязателен'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "DELETE FROM t_p77282076_fruit_shop_creation.faq WHERE id = %s",
                (int(faq_id),)
            )
            conn.commit()
            
            clear_faq_cache()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'FAQ удален'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()