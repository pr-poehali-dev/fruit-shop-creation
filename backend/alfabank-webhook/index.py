import json
import os
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Handle Alfabank payment status checks and webhooks via getOrderStatusExtended.do API
    Args: event with httpMethod, queryStringParameters (orderId) or body
          context with request_id
    Returns: HTTP response with payment status and DB updates
    '''
    import psycopg2
    from psycopg2.extras import RealDictCursor
    
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute("SELECT alfabank_login, alfabank_password FROM site_settings WHERE id = 1")
        settings = cur.fetchone()
        
        if not settings or not settings.get('alfabank_login') or not settings.get('alfabank_password'):
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Alfabank credentials not configured'}),
                'isBase64Encoded': False
            }
        
        username = settings['alfabank_login']
        password = settings['alfabank_password']
    finally:
        cur.close()
        conn.close()
    
    alfabank_status_url = 'https://web.rbsuat.com/ab/rest/getOrderStatusExtended.do'
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        alfa_order_id = params.get('orderId')
        
        if not alfa_order_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'orderId parameter required'}),
                'isBase64Encoded': False
            }
        
        try:
            response = requests.post(alfabank_status_url, data={
                'userName': username,
                'password': password,
                'orderId': alfa_order_id
            }, timeout=10)
            response.raise_for_status()
            
            status_data = response.json()
            
            order_status = status_data.get('orderStatus')
            
            if order_status == 2:
                json_params = json.loads(status_data.get('merchantOrderParams', [{}])[0].get('value', '{}'))
                user_id = json_params.get('user_id')
                order_id = json_params.get('order_id')
                amount_kopecks = status_data.get('amount', 0)
                amount = float(amount_kopecks) / 100
                
                if user_id and amount > 0:
                    db_url = os.environ.get('DATABASE_URL')
                    conn = psycopg2.connect(db_url)
                    cur = conn.cursor(cursor_factory=RealDictCursor)
                    
                    try:
                        if order_id:
                            cur.execute(
                                f"UPDATE orders SET status = 'confirmed', payment_verified = true WHERE id = {order_id}"
                            )
                        else:
                            cur.execute(
                                f"UPDATE users SET balance = balance + {amount} WHERE id = {user_id}"
                            )
                            cur.execute(
                                f"INSERT INTO transactions (user_id, type, amount, description) VALUES ({user_id}, 'deposit', {amount}, 'Пополнение через Альфа-Банк')"
                            )
                        
                        conn.commit()
                    finally:
                        cur.close()
                        conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'orderStatus': order_status,
                    'statusDescription': {
                        0: 'Заказ зарегистрирован, но не оплачен',
                        1: 'Предавторизованная сумма захолдирована',
                        2: 'Проведена полная авторизация суммы заказа',
                        3: 'Авторизация отменена',
                        4: 'По транзакции была проведена операция возврата',
                        5: 'Инициирована авторизация через ACS банка-эмитента',
                        6: 'Авторизация отклонена'
                    }.get(order_status, 'Неизвестный статус'),
                    'details': status_data
                }),
                'isBase64Encoded': False
            }
        
        except requests.exceptions.RequestException as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Failed to check payment status', 'details': str(e)}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }