import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Webhook endpoint for Sberbank payment notifications
    Args: event with httpMethod, body from Sberbank API
    Returns: HTTP response confirming webhook receipt
    '''
    import psycopg2
    from psycopg2.extras import RealDictCursor
    
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        payment_id = body_data.get('payment_id')
        status = body_data.get('status')
        amount = float(body_data.get('amount', 0))
        user_id = body_data.get('user_id')
        order_id = body_data.get('order_id')
        
        print(f"Webhook received: payment_id={payment_id}, status={status}, amount={amount}, user_id={user_id}")
        
        if status == 'success' and amount > 0:
            db_url = os.environ.get('DATABASE_URL')
            conn = psycopg2.connect(db_url)
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            try:
                if order_id:
                    cur.execute(
                        f"UPDATE orders SET status = 'confirmed', payment_verified = true WHERE id = {order_id}"
                    )
                    print(f"Order {order_id} marked as confirmed")
                
                elif user_id:
                    cur.execute(
                        f"UPDATE users SET balance = balance + {amount} WHERE id = {user_id}"
                    )
                    cur.execute(
                        f"INSERT INTO transactions (user_id, type, amount, description) VALUES ({user_id}, 'deposit', {amount}, 'Пополнение через СберБанк (авто)')"
                    )
                    print(f"User {user_id} balance increased by {amount}")
                
                conn.commit()
                
            finally:
                cur.close()
                conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Webhook processed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
