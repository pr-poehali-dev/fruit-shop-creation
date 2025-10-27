'''
Business: Чат поддержки с ботом Анфисой и администраторами
Args: event с httpMethod, body, queryStringParameters; context с request_id
Returns: HTTP response с данными чата и сообщениями
'''

import json
import os
import psycopg2
from typing import Dict, Any, List, Optional

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def search_faq(question: str, cur) -> Optional[Dict[str, Any]]:
    question_lower = question.lower().strip()
    
    operator_keywords = ['оператор', 'администратор', 'человек', 'живой', 'сотрудник', 'менеджер', 'помощь', 'помогите']
    if any(keyword in question_lower for keyword in operator_keywords):
        return None
    
    cur.execute(
        "SELECT id, question, answer, keywords FROM t_p77282076_fruit_shop_creation.faq WHERE is_active = true"
    )
    faqs = cur.fetchall()
    
    best_match = None
    best_score = 0
    
    for faq in faqs:
        faq_id, faq_question, faq_answer, keywords = faq
        score = 0
        
        # Ключевые слова дают больше очков
        if keywords:
            for keyword in keywords:
                keyword_lower = keyword.lower().strip()
                if keyword_lower in question_lower:
                    score += 5
        
        # Слова из вопроса FAQ ищем в сообщении пользователя
        question_words = faq_question.lower().split()
        for word in question_words:
            # Убираем знаки препинания
            word_clean = word.strip('?!.,;:')
            # Ищем слова длиннее 3 символов
            if len(word_clean) > 3 and word_clean in question_lower:
                score += 2
        
        # Слова из сообщения пользователя ищем в вопросе FAQ
        user_words = question_lower.split()
        for word in user_words:
            word_clean = word.strip('?!.,;:')
            if len(word_clean) > 3 and word_clean in faq_question.lower():
                score += 2
        
        if score > best_score:
            best_score = score
            best_match = {
                'id': faq_id,
                'question': faq_question,
                'answer': faq_answer
            }
    
    # Порог понижен до 3 (раньше 1, но теперь очки больше)
    if best_score >= 3:
        return best_match
    return None

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
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
                if is_guest:
                    cur.execute(
                        "INSERT INTO t_p77282076_fruit_shop_creation.support_chats (guest_id, status) VALUES (%s, 'bot') RETURNING id",
                        (str(user_id),)
                    )
                else:
                    cur.execute(
                        "INSERT INTO t_p77282076_fruit_shop_creation.support_chats (user_id, status) VALUES (%s, 'bot') RETURNING id",
                        (int(user_id),)
                    )
                conn.commit()
                chat_id = cur.fetchone()[0]
                
                cur.execute(
                    "INSERT INTO t_p77282076_fruit_shop_creation.support_messages (chat_id, sender_type, sender_name, message, is_read, ticket_id) VALUES (%s, 'bot', 'Анфиса', %s, true, 1)",
                    (chat_id, 'Здравствуйте! Я Анфиса, бот-помощник. Чем могу помочь? 😊')
                )
                conn.commit()
                
                chat_data = {
                    'id': chat_id,
                    'status': 'bot',
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
                SELECT id, sender_type, sender_name, message, created_at, is_read
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
                'is_read': row[5]
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
                    faq_answer = search_faq(message, cur)
                    
                    if faq_answer:
                        cur.execute(
                            "INSERT INTO t_p77282076_fruit_shop_creation.support_messages (chat_id, sender_type, sender_name, message, is_read, ticket_id) VALUES (%s, 'bot', 'Анфиса', %s, true, 1) RETURNING id",
                            (int(chat_id), faq_answer['answer'])
                        )
                        bot_message_id = cur.fetchone()[0]
                        conn.commit()
                        bot_response = faq_answer['answer']
                    else:
                        bot_response = 'Извините, я не нашла ответа на ваш вопрос. Сейчас переведу вас на администратора...'
                        
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
                    "SELECT full_name FROM t_p77282076_fruit_shop_creation.users WHERE id = %s",
                    (int(admin_id),)
                )
                admin_name = cur.fetchone()[0]
                
                cur.execute(
                    "INSERT INTO t_p77282076_fruit_shop_creation.support_messages (chat_id, sender_type, sender_id, sender_name, message, is_read, ticket_id) VALUES (%s, 'admin', %s, %s, %s, true, 1)",
                    (int(chat_id), int(admin_id), admin_name, message)
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
                
                cur.execute(
                    "SELECT full_name FROM t_p77282076_fruit_shop_creation.users WHERE id = %s",
                    (int(admin_id),)
                )
                admin_name = cur.fetchone()[0]
                
                cur.execute(
                    "UPDATE t_p77282076_fruit_shop_creation.support_chats SET status = 'active', admin_id = %s, admin_name = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                    (int(admin_id), admin_name, int(chat_id))
                )
                
                cur.execute(
                    "INSERT INTO t_p77282076_fruit_shop_creation.support_messages (chat_id, sender_type, sender_name, message, is_read, ticket_id) VALUES (%s, 'admin', %s, %s, true, 1)",
                    (int(chat_id), admin_name, f'Здравствуйте! На связи {admin_name}. Чем могу помочь?')
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Чат взят в работу'}, ensure_ascii=False),
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
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()