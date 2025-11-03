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
                'Access-Control-Allow-Headers': 'Content-Type, Accept, Cache-Control, X-User-Id, X-Auth-Token, X-Session-Id',
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
                
                orders_list = []
                for order in orders:
                    order_dict = dict(order)
                    
                    if order_dict.get('is_preorder'):
                        order_dict['is_fully_paid'] = bool(order_dict.get('second_payment_paid'))
                    else:
                        amount_paid = float(order_dict.get('amount_paid') or 0)
                        total_amount = float(order_dict.get('total_amount') or 0)
                        order_dict['is_fully_paid'] = amount_paid >= total_amount
                    
                    orders_list.append(order_dict)
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'orders': orders_list}, default=str),
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
                
                orders_list = []
                for order in orders:
                    order_dict = dict(order)
                    
                    if order_dict.get('is_preorder'):
                        order_dict['is_fully_paid'] = bool(order_dict.get('second_payment_paid'))
                    else:
                        amount_paid = float(order_dict.get('amount_paid') or 0)
                        total_amount = float(order_dict.get('total_amount') or 0)
                        order_dict['is_fully_paid'] = amount_paid >= total_amount
                    
                    orders_list.append(order_dict)
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'orders': orders_list}, default=str),
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
            
            if action == 'pay_delivery':
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
                    f"SELECT custom_delivery_price, delivery_price_set_by_admin, user_id, status FROM orders WHERE id = {order_id}"
                )
                order = cur.fetchone()
                
                if not order:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Order not found'}),
                        'isBase64Encoded': False
                    }
                
                if not order['delivery_price_set_by_admin'] or not order['custom_delivery_price']:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Delivery price not set'}),
                        'isBase64Encoded': False
                    }
                
                if order['status'] != 'processing':
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Delivery can only be paid when order is in processing status'}),
                        'isBase64Encoded': False
                    }
                
                delivery_amount = float(order['custom_delivery_price'])
                
                if payment_method == 'balance':
                    cur.execute(f"SELECT balance FROM users WHERE id = {user_id}")
                    user = cur.fetchone()
                    
                    if not user or float(user['balance']) < delivery_amount:
                        return {
                            'statusCode': 400,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Недостаточно средств на балансе'}),
                            'isBase64Encoded': False
                        }
                    
                    cur.execute(
                        f"UPDATE users SET balance = balance - {delivery_amount} WHERE id = {user_id}"
                    )
                    cur.execute(
                        f"INSERT INTO transactions (user_id, type, amount, description) VALUES ({user_id}, 'delivery_payment', {delivery_amount}, 'Оплата доставки для заказа #{order_id}')"
                    )
                    cur.execute(
                        f"UPDATE orders SET delivery_price_set_by_admin = FALSE, delivery_paid = TRUE, payment_deadline = NULL, amount_paid = amount_paid + {delivery_amount} WHERE id = {order_id}"
                    )
                    
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'payment_method': 'balance'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'payment_method': 'card', 'amount': delivery_amount}),
                    'isBase64Encoded': False
                }
            
            if action == 'complete_preorder_payment':
                order_id = body_data.get('order_id')
                user_id = body_data.get('user_id')
                payment_method = body_data.get('payment_method', 'balance')
                payment_type = body_data.get('payment_type', 'second_payment')  # 'second_payment' или 'delivery'
                
                if not order_id or not user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'order_id and user_id required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    f"SELECT total_amount, amount_paid, is_preorder, user_id, second_payment_amount, second_payment_paid, custom_delivery_price, delivery_paid FROM orders WHERE id = {order_id}"
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
                
                # Определяем сумму платежа
                if payment_type == 'second_payment':
                    if order['second_payment_paid']:
                        return {
                            'statusCode': 400,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Второй платёж уже оплачен'}),
                            'isBase64Encoded': False
                        }
                    payment_amount = float(order['second_payment_amount'])
                    update_field = 'second_payment_paid = TRUE'
                    description = f'Оплата второй части заказа #{order_id} (50%)'
                elif payment_type == 'delivery':
                    if order['delivery_paid']:
                        return {
                            'statusCode': 400,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Доставка уже оплачена'}),
                            'isBase64Encoded': False
                        }
                    payment_amount = float(order['custom_delivery_price'] or 500)
                    update_field = 'delivery_paid = TRUE'
                    description = f'Оплата доставки для заказа #{order_id}'
                else:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid payment_type'}),
                        'isBase64Encoded': False
                    }
                
                if payment_method == 'balance':
                    cur.execute(f"SELECT balance FROM users WHERE id = {user_id}")
                    user = cur.fetchone()
                    
                    if not user or float(user['balance']) < payment_amount:
                        return {
                            'statusCode': 400,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Недостаточно средств на балансе'}),
                            'isBase64Encoded': False
                        }
                    
                    cur.execute(
                        f"UPDATE users SET balance = balance - {payment_amount} WHERE id = {user_id}"
                    )
                    cur.execute(
                        f"INSERT INTO transactions (user_id, type, amount, description) VALUES ({user_id}, 'purchase', {payment_amount}, '{description}')"
                    )
                    cur.execute(
                        f"UPDATE orders SET {update_field}, amount_paid = amount_paid + {payment_amount} WHERE id = {order_id}"
                    )
                    
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'amount': payment_amount}),
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
            
            items_amount = sum(float(item['price']) * int(item['quantity']) for item in items)
            
            # Для Барнаула при предзаказе:
            # - Списываем 50% от товаров сейчас
            # - Доставка 500₽ оплачивается отдельно
            if is_preorder:
                total_amount = items_amount * 0.5
                delivery_amount = 500  # Фиксированная доставка для Барнаула
            else:
                full_order_amount = body_data.get('full_order_amount', items_amount)
                if full_order_amount is not None:
                    full_order_amount = float(full_order_amount)
                else:
                    full_order_amount = items_amount
                delivery_amount = full_order_amount - items_amount
                total_amount = full_order_amount
            
            print(f"ORDER CREATE: is_preorder={is_preorder}, items={items_amount}, delivery={delivery_amount}, to_charge={total_amount}, payment={payment_method}")
            
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
                
                print(f"CHARGING USER: user_id={user_id}, amount={total_amount}")
                cur.execute(
                    f"UPDATE users SET balance = balance - {total_amount} WHERE id = {user_id}"
                )
                
                cashback_amount = items_amount * cashback_percent
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
                cashback_earned = items_amount * cashback_percent
                amount_paid = total_amount
            
            zone_id_sql = f", {delivery_zone_id}" if delivery_zone_id else ", NULL"
            delivery_price_sql = f", {delivery_amount}" if delivery_amount > 0 else ", NULL"
            
            # Для предзаказа: сохраняем сумму второго платежа (50% от товаров)
            second_payment_amount = items_amount * 0.5 if is_preorder else 0
            delivery_paid = False if is_preorder else (delivery_amount == 0)
            
            cur.execute(
                f"INSERT INTO orders (user_id, total_amount, payment_method, delivery_address, delivery_type, delivery_zone_id, cashback_earned, amount_paid, is_preorder, custom_delivery_price, second_payment_amount, second_payment_paid, delivery_paid) VALUES ({user_id}, {items_amount}, '{payment_method}', '{delivery_address}', '{delivery_type}'{zone_id_sql}, {cashback_earned}, {amount_paid}, {is_preorder}{delivery_price_sql}, {second_payment_amount}, FALSE, {delivery_paid}) RETURNING id"
            )
            order_id = cur.fetchone()['id']
            
            for item in items:
                product_id = item['product_id']
                quantity = item['quantity']
                price = item['price']
                cur.execute(
                    f"INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ({order_id}, {product_id}, {quantity}, {price})"
                )
            
            cur.execute(f"SELECT referred_by_code FROM users WHERE id = {user_id}")
            user_referral = cur.fetchone()
            if user_referral and user_referral['referred_by_code']:
                referral_code = user_referral['referred_by_code']
                cur.execute(
                    f"SELECT rc.user_id, r.id as referral_id, r.first_order_total, r.reward_given FROM t_p77282076_fruit_shop_creation.referral_codes rc LEFT JOIN t_p77282076_fruit_shop_creation.referrals r ON r.referred_id = {user_id} WHERE rc.referral_code = '{referral_code}'"
                )
                referrer_data = cur.fetchone()
                if referrer_data and referrer_data['user_id']:
                    referrer_id = referrer_data['user_id']
                    existing_referral_id = referrer_data.get('referral_id')
                    previous_order_total = referrer_data.get('first_order_total')
                    reward_already_given = referrer_data.get('reward_given')
                    
                    if not existing_referral_id:
                        cur.execute(
                            f"INSERT INTO t_p77282076_fruit_shop_creation.referrals (referrer_id, referred_id, referral_code, first_order_total, reward_given) VALUES ({referrer_id}, {user_id}, '{referral_code}', {full_order_amount}, {str(full_order_amount >= 1500).lower()})"
                        )
                        if full_order_amount >= 1500:
                            cur.execute(
                                f"UPDATE users SET balance = balance + 500 WHERE id = {referrer_id}"
                            )
                            cur.execute(
                                f"INSERT INTO transactions (user_id, type, amount, description) VALUES ({referrer_id}, 'referral_bonus', 500, 'Бонус за приглашение друга (заказ от 1500₽)')"
                            )
                            print(f"Referral bonus 500₽ auto-credited to user {referrer_id} for referred user {user_id} (order #{order_id}, amount {full_order_amount}₽)")
                    elif not reward_already_given:
                        current_total = float(previous_order_total or 0)
                        new_total = current_total + full_order_amount
                        
                        cur.execute(
                            f"UPDATE t_p77282076_fruit_shop_creation.referrals SET first_order_total = {new_total} WHERE id = {existing_referral_id}"
                        )
                        
                        if new_total >= 1500:
                            cur.execute(
                                f"UPDATE t_p77282076_fruit_shop_creation.referrals SET reward_given = TRUE WHERE id = {existing_referral_id}"
                            )
                            cur.execute(
                                f"UPDATE users SET balance = balance + 500 WHERE id = {referrer_id}"
                            )
                            cur.execute(
                                f"INSERT INTO transactions (user_id, type, amount, description) VALUES ({referrer_id}, 'referral_bonus', 500, 'Бонус за приглашение друга (накоплено {new_total}₽)')"
                            )
                            print(f"Referral bonus 500₽ auto-credited to user {referrer_id} for referred user {user_id} (accumulated {new_total}₽ from multiple orders)")
                        else:
                            print(f"Referral progress updated: user {user_id} accumulated {new_total}₽ out of required 1500₽")
            
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
            custom_delivery_price = body_data.get('custom_delivery_price')
            
            if not order_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'order_id required'}),
                    'isBase64Encoded': False
                }
            
            if custom_delivery_price is not None:
                cur.execute(
                    f"UPDATE orders SET custom_delivery_price = {custom_delivery_price}, delivery_price_set_by_admin = TRUE WHERE id = {order_id}"
                )
            
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
            
            cur.execute(f"SELECT user_id, is_preorder, custom_delivery_price, delivery_price_set_by_admin, delivery_type FROM orders WHERE id = {order_id}")
            order_user = cur.fetchone()
            if order_user and status in ['delivered', 'cancelled', 'confirmed', 'processing']:
                user_id_for_notif = order_user['user_id']
                is_preorder = order_user['is_preorder']
                delivery_price_set = order_user['delivery_price_set_by_admin']
                delivery_price = order_user['custom_delivery_price']
                delivery_type_val = order_user['delivery_type']
                
                if status == 'delivered':
                    cur.execute(f"SELECT referred_id FROM t_p77282076_fruit_shop_creation.referrals WHERE referred_id = {user_id_for_notif} AND first_order_made = FALSE")
                    referral = cur.fetchone()
                    if referral:
                        cur.execute(f"UPDATE t_p77282076_fruit_shop_creation.referrals SET first_order_made = TRUE, reward_given = TRUE WHERE referred_id = {user_id_for_notif}")
                        cur.execute(f"SELECT referrer_id, reward_amount FROM t_p77282076_fruit_shop_creation.referrals WHERE referred_id = {user_id_for_notif}")
                        ref_data = cur.fetchone()
                        if ref_data:
                            referrer_id = ref_data['referrer_id']
                            reward = float(ref_data['reward_amount'])
                            cur.execute(f"UPDATE users SET balance = balance + {reward} WHERE id = {referrer_id}")
                            cur.execute(f"INSERT INTO transactions (user_id, type, amount, description) VALUES ({referrer_id}, 'referral_bonus', {reward}, 'Бонус за приглашенного друга')")
                
                status_messages = {
                    'delivered': 'Ваш заказ доставлен! Оцените качество обслуживания',
                    'cancelled': 'Ваш заказ отменён',
                    'confirmed': 'Ваш заказ подтвержден и готовится к отправке'
                }
                
                if status == 'processing' and delivery_price_set and delivery_type_val == 'delivery':
                    title = 'Цена доставки установлена'
                    message = f'Стоимость доставки составит {delivery_price}₽. Пожалуйста, оплатите доставку в течение 3 дней'
                    cur.execute(
                        f"UPDATE orders SET payment_deadline = CURRENT_TIMESTAMP + INTERVAL '3 days' WHERE id = {order_id}"
                    )
                elif status == 'processing' and is_preorder:
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