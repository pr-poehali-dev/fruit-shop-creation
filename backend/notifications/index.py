'''
Business: Управление уведомлениями пользователей
Args: event с httpMethod, body, queryStringParameters; context с request_id
Returns: HTTP response с уведомлениями пользователя
'''

import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('x-user-id') or headers.get('X-User-Id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'User ID required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute(
                f"SELECT id, type, title, message, entity_type, entity_id, is_read, requires_rating, rating_given, created_at FROM notifications WHERE user_id = {user_id} ORDER BY created_at DESC LIMIT 50"
            )
            
            notifications = []
            for row in cur.fetchall():
                notifications.append({
                    'id': row[0],
                    'type': row[1],
                    'title': row[2],
                    'message': row[3],
                    'entity_type': row[4],
                    'entity_id': row[5],
                    'is_read': row[6],
                    'requires_rating': row[7],
                    'rating_given': row[8],
                    'created_at': row[9].isoformat() if row[9] else None
                })
            
            cur.execute(f"SELECT COUNT(*) FROM notifications WHERE user_id = {user_id} AND is_read = FALSE")
            unread_count = cur.fetchone()[0]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'notifications': notifications,
                    'unread_count': unread_count
                })
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            notification_id = body_data.get('notification_id')
            
            if not notification_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'notification_id required'})
                }
            
            cur.execute(
                f"UPDATE notifications SET is_read = TRUE WHERE id = {notification_id} AND user_id = {user_id}"
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'mark_all_read':
                cur.execute(f"UPDATE notifications SET is_read = TRUE WHERE user_id = {user_id}")
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'clear_all':
                cur.execute(f"DELETE FROM notifications WHERE user_id = {user_id}")
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'check_expired_preorders':
                cur.execute(
                    """SELECT id, user_id, total_amount 
                       FROM orders 
                       WHERE is_preorder = TRUE 
                       AND status = 'processing' 
                       AND payment_deadline IS NOT NULL 
                       AND payment_deadline < CURRENT_TIMESTAMP 
                       AND amount_paid < total_amount"""
                )
                expired_orders = cur.fetchall()
                
                cancelled_count = 0
                for order in expired_orders:
                    order_id_val = order[0]
                    user_id_val = order[1]
                    
                    cur.execute(
                        f"UPDATE orders SET status = 'cancelled', cancelled_by = 'system', cancellation_reason = 'Не оплачен в течение 3 дней', updated_at = CURRENT_TIMESTAMP WHERE id = {order_id_val}"
                    )
                    
                    cur.execute(
                        f"INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id) VALUES ({user_id_val}, 'order_status', 'Заказ отменён', 'Ваш предзаказ был автоматически отменён из-за отсутствия оплаты в течение 3 дней', 'order', {order_id_val})"
                    )
                    
                    cancelled_count += 1
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'cancelled_orders': cancelled_count
                    })
                }
            
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Invalid action'})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()