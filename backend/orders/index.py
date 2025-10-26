import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage customer orders and order history
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with orders data
    '''
    import psycopg2
    from psycopg2.extras import RealDictCursor
    
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            user_id = params.get('user_id')
            get_all = params.get('all')
            
            if get_all == 'true':
                cur.execute(
                    """SELECT o.*, 
                       u.full_name as user_name,
                       u.phone as user_phone,
                       json_agg(json_build_object(
                           'id', oi.id,
                           'product_id', oi.product_id,
                           'product_name', p.name,
                           'quantity', oi.quantity,
                           'price', oi.price,
                           'is_out_of_stock', oi.is_out_of_stock,
                           'available_quantity', oi.available_quantity,
                           'available_price', oi.available_price
                       )) as items
                       FROM orders o
                       LEFT JOIN users u ON o.user_id = u.id
                       LEFT JOIN order_items oi ON o.id = oi.order_id
                       LEFT JOIN products p ON oi.product_id = p.id
                       GROUP BY o.id, u.full_name, u.phone
                       ORDER BY o.created_at DESC"""
                )
                orders = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'orders': [dict(o) for o in orders]}, default=str),
                    'isBase64Encoded': False
                }
            
            if user_id:
                cur.execute(
                    f"""SELECT o.*, 
                       json_agg(json_build_object(
                           'id', oi.id,
                           'product_id', oi.product_id,
                           'product_name', p.name,
                           'quantity', oi.quantity,
                           'price', oi.price,
                           'is_out_of_stock', oi.is_out_of_stock,
                           'available_quantity', oi.available_quantity,
                           'available_price', oi.available_price
                       )) as items
                       FROM orders o
                       LEFT JOIN order_items oi ON o.id = oi.order_id
                       LEFT JOIN products p ON oi.product_id = p.id
                       WHERE o.user_id = {user_id}
                       GROUP BY o.id
                       ORDER BY o.created_at DESC"""
                )
                orders = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'orders': [dict(o) for o in orders]}, default=str),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id required'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'cancel_order':
                order_id = body_data.get('order_id')
                cancelled_by = body_data.get('cancelled_by', 'user')
                cancellation_reason = body_data.get('cancellation_reason', 'Отменён пользователем').replace("'", "''")
                
                if not order_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'order_id required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    f"SELECT status, payment_method, user_id, amount_paid, cashback_earned FROM orders WHERE id = {order_id}"
                )
                order = cur.fetchone()
                
                if not order:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Order not found'}),
                        'isBase64Encoded': False
                    }
                
                if order['status'] not in ['pending', 'processing']:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Можно отменить только заказы в статусе ожидания или обработки'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    f"UPDATE orders SET status = 'cancelled', cancelled_by = '{cancelled_by}', cancellation_reason = '{cancellation_reason}', updated_at = CURRENT_TIMESTAMP WHERE id = {order_id}"
                )
                
                if order['payment_method'] == 'balance':
                    amount_paid = float(order['amount_paid'] or 0)
                    cashback_earned = float(order['cashback_earned'] or 0)
                    
                    print(f"Cancelling order #{order_id}: returning {amount_paid} to balance, removing {cashback_earned} cashback")
                    
                    cur.execute(
                        f"UPDATE users SET balance = balance + {amount_paid}, cashback = cashback - {cashback_earned} WHERE id = {order['user_id']}"
                    )
                    cur.execute(
                        f"INSERT INTO transactions (user_id, type, amount, description) VALUES ({order['user_id']}, 'deposit', {amount_paid}, 'Возврат средств за отменённый заказ #{order_id}')"
                    )
                    cur.execute(
                        f"INSERT INTO transactions (user_id, type, amount, description) VALUES ({order['user_id']}, 'cashback_cancelled', {cashback_earned}, 'Аннулирование кэшбека за отмену заказа #{order_id}')"
                    )
                    
                    print(f"Order #{order_id} cancelled successfully")
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            if action == 'complete_preorder_payment':
                order_id = body_data.get('order_id')
                user_id = body_data.get('user_id')
                payment_method = body_data.get('payment_method', 'balance')
                
                if not order_id or not user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'order_id and user_id required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    f"SELECT total_amount, amount_paid, is_preorder, user_id FROM orders WHERE id = {order_id}"
                )
                order = cur.fetchone()
                
                if not order:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Order not found'}),
                        'isBase64Encoded': False
                    }
                
                if not order['is_preorder']:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Not a preorder'}),
                        'isBase64Encoded': False
                    }
                
                remaining_amount = float(order['total_amount']) - float(order['amount_paid'] or 0)
                
                if payment_method == 'balance':
                    cur.execute(f"SELECT balance FROM users WHERE id = {user_id}")
                    user = cur.fetchone()
                    
                    if not user or float(user['balance']) < remaining_amount:
                        return {
                            'statusCode': 400,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Недостаточно средств на балансе'}),
                            'isBase64Encoded': False
                        }
                    
                    cur.execute(
                        f"UPDATE users SET balance = balance - {remaining_amount} WHERE id = {user_id}"
                    )
                    cur.execute(
                        f"INSERT INTO transactions (user_id, type, amount, description) VALUES ({user_id}, 'purchase', {remaining_amount}, 'Доплата за предзаказ #{order_id}')"
                    )
                    cur.execute(
                        f"UPDATE orders SET amount_paid = total_amount, payment_deadline = NULL WHERE id = {order_id}"
                    )
                    
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid payment method'}),
                    'isBase64Encoded': False
                }
            
            user_id = body_data.get('user_id')
            items = body_data.get('items', [])
            payment_method = body_data.get('payment_method', 'card')
            delivery_address = body_data.get('delivery_address', '').replace("'", "''")
            delivery_type = body_data.get('delivery_type', 'pickup')
            delivery_zone_id = body_data.get('delivery_zone_id')
            cashback_percent_input = body_data.get('cashback_percent', 5)
            is_preorder = body_data.get('is_preorder', False)
            
            total_amount_full = body_data.get('total_amount')
            if total_amount_full is None:
                total_amount_full = sum(float(item['price']) * int(item['quantity']) for item in items)
            else:
                total_amount_full = float(total_amount_full)
            
            total_amount = total_amount_full if not is_preorder else total_amount_full * 0.5
            
            cashback_percent = float(cashback_percent_input) / 100
            
            if payment_method == 'balance':
                cur.execute(f"SELECT balance FROM users WHERE id = {user_id}")
                user = cur.fetchone()
                if not user or float(user['balance']) < total_amount:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Недостаточно средств на балансе'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    f"UPDATE users SET balance = balance - {total_amount} WHERE id = {user_id}"
                )
                
                cashback_amount = total_amount * cashback_percent
                cur.execute(
                    f"UPDATE users SET cashback = cashback + {cashback_amount} WHERE id = {user_id}"
                )
                
                cur.execute(
                    f"INSERT INTO transactions (user_id, type, amount, description) VALUES ({user_id}, 'purchase', {total_amount}, 'Оплата заказа')"
                )
                cur.execute(
                    f"INSERT INTO transactions (user_id, type, amount, description) VALUES ({user_id}, 'cashback_earned', {cashback_amount}, 'Кэшбек {int(cashback_percent * 100)}% от заказа')"
                )
            
            cashback_earned = 0
            amount_paid = 0
            
            if payment_method == 'balance':
                cashback_earned = total_amount * cashback_percent
                amount_paid = total_amount
            
            zone_id_sql = f", {delivery_zone_id}" if delivery_zone_id else ", NULL"
            
            cur.execute(
                f"INSERT INTO orders (user_id, total_amount, payment_method, delivery_address, delivery_type, delivery_zone_id, cashback_earned, amount_paid, is_preorder) VALUES ({user_id}, {total_amount_full}, '{payment_method}', '{delivery_address}', '{delivery_type}'{zone_id_sql}, {cashback_earned}, {amount_paid}, {is_preorder}) RETURNING id"
            )
            order_id = cur.fetchone()['id']
            
            for item in items:
                product_id = item['product_id']
                quantity = item['quantity']
                price = item['price']
                cur.execute(
                    f"INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ({order_id}, {product_id}, {quantity}, {price})"
                )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'order_id': order_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            order_id = body_data.get('order_id')
            status = body_data.get('status', 'pending').replace("'", "''")
            rejection_reason = body_data.get('rejection_reason', '').replace("'", "''")
            
            if not order_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'order_id required'}),
                    'isBase64Encoded': False
                }
            
            if status == 'cancelled':
                cancellation_reason = rejection_reason if rejection_reason else 'Отменён администратором'
                cur.execute(
                    f"UPDATE orders SET status = '{status}', cancelled_by = 'admin', cancellation_reason = '{cancellation_reason}', updated_at = CURRENT_TIMESTAMP WHERE id = {order_id}"
                )
            elif rejection_reason:
                cur.execute(
                    f"UPDATE orders SET status = '{status}', rejection_reason = '{rejection_reason}', updated_at = CURRENT_TIMESTAMP WHERE id = {order_id}"
                )
            else:
                cur.execute(
                    f"UPDATE orders SET status = '{status}', updated_at = CURRENT_TIMESTAMP WHERE id = {order_id}"
                )
            
            cur.execute(f"SELECT user_id, is_preorder FROM orders WHERE id = {order_id}")
            order_user = cur.fetchone()
            if order_user and status in ['delivered', 'cancelled', 'confirmed', 'processing']:
                user_id_for_notif = order_user['user_id']
                is_preorder = order_user['is_preorder']
                
                status_messages = {
                    'delivered': 'Ваш заказ доставлен! Оцените качество обслуживания',
                    'cancelled': 'Ваш заказ отменён',
                    'confirmed': 'Ваш заказ подтвержден и готовится к отправке'
                }
                
                if status == 'processing' and is_preorder:
                    title = 'Необходима доплата за заказ'
                    message = 'Ваш предзаказ обрабатывается! Пожалуйста, оплатите оставшиеся 50% стоимости заказа в течение 3 дней'
                    cur.execute(
                        f"UPDATE orders SET payment_deadline = CURRENT_TIMESTAMP + INTERVAL '3 days' WHERE id = {order_id}"
                    )
                else:
                    title = 'Статус заказа изменён'
                    message = status_messages.get(status, f'Статус заказа изменён на {status}')
                
                requires_rating = status == 'delivered'
                
                cur.execute(
                    f"INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, requires_rating) VALUES ({user_id_for_notif}, 'order_status', '{title}', '{message}', 'order', {order_id}, {requires_rating})"
                )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif method == 'PATCH':
            body_data = json.loads(event.get('body', '{}'))
            item_id = body_data.get('item_id')
            is_out_of_stock = body_data.get('is_out_of_stock')
            available_quantity = body_data.get('available_quantity')
            available_price = body_data.get('available_price')
            
            if not item_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'item_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(f"SELECT order_id FROM order_items WHERE id = {item_id}")
            item_data = cur.fetchone()
            if not item_data:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Item not found'}),
                    'isBase64Encoded': False
                }
            
            order_id = item_data['order_id']
            
            if is_out_of_stock is not None:
                cur.execute(
                    f"UPDATE order_items SET is_out_of_stock = {is_out_of_stock} WHERE id = {item_id}"
                )
            
            if available_quantity is not None:
                cur.execute(
                    f"UPDATE order_items SET available_quantity = {available_quantity} WHERE id = {item_id}"
                )
            
            if available_price is not None:
                cur.execute(
                    f"UPDATE order_items SET available_price = {available_price} WHERE id = {item_id}"
                )
            
            cur.execute(
                f"""SELECT COALESCE(SUM(CASE WHEN is_out_of_stock = FALSE THEN price * quantity ELSE 0 END), 0) as new_total
                   FROM order_items WHERE order_id = {order_id}"""
            )
            total_data = cur.fetchone()
            new_total = float(total_data['new_total'])
            
            cur.execute(
                f"SELECT payment_method, amount_paid FROM orders WHERE id = {order_id}"
            )
            order_info = cur.fetchone()
            
            new_amount_paid = new_total if order_info and order_info['payment_method'] == 'balance' else (order_info['amount_paid'] if order_info else 0)
            
            cur.execute(
                f"UPDATE orders SET total_amount = {new_total}, amount_paid = {new_amount_paid}, updated_at = CURRENT_TIMESTAMP WHERE id = {order_id}"
            )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'new_total': new_total}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            order_id = body_data.get('order_id')
            
            if not order_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'order_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(f"DELETE FROM order_items WHERE order_id = {order_id}")
            cur.execute(f"DELETE FROM orders WHERE id = {order_id}")
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()