import json
import hashlib
import os
from typing import Dict, Any
from urllib.parse import parse_qs
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Обработка Result URL (webhook) от Robokassa после успешной оплаты и зачисление средств
    Args: event - dict с httpMethod, body или queryStringParameters
          context - объект с request_id
    Returns: HTTP response OK{invoice_id} для Robokassa или ошибка
    '''
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
            'body': ''
        }
    
    password2 = os.environ.get('ROBOKASSA_PASSWORD2', '')
    
    if not password2:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'text/plain'},
            'isBase64Encoded': False,
            'body': 'Configuration error'
        }
    
    params = {}
    if method == 'POST':
        body = event.get('body', '')
        if body:
            parsed = parse_qs(body)
            params = {k: v[0] if isinstance(v, list) else v for k, v in parsed.items()}
    else:
        params = event.get('queryStringParameters', {})
    
    out_sum = params.get('OutSum', '')
    inv_id = params.get('InvId', '')
    signature_value = params.get('SignatureValue', '').upper()
    
    shp_user_id = params.get('Shp_UserId', '')
    
    if not out_sum or not inv_id or not signature_value:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'text/plain'},
            'isBase64Encoded': False,
            'body': 'Missing parameters'
        }
    
    signature_string = f"{out_sum}:{inv_id}:{password2}"
    if shp_user_id:
        signature_string += f":Shp_UserId={shp_user_id}"
    
    calculated_signature = hashlib.md5(signature_string.encode('utf-8')).hexdigest().upper()
    
    if calculated_signature != signature_value:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'text/plain'},
            'isBase64Encoded': False,
            'body': 'Invalid signature'
        }
    
    if shp_user_id:
        database_url = os.environ.get('DATABASE_URL', '')
        if database_url:
            try:
                conn = psycopg2.connect(database_url)
                cur = conn.cursor(cursor_factory=RealDictCursor)
                
                amount = float(out_sum)
                user_id = int(shp_user_id)
                
                cur.execute(
                    "UPDATE users SET balance = balance + " + str(amount) + " WHERE id = " + str(user_id)
                )
                
                cur.execute(
                    "INSERT INTO balance_transactions (user_id, amount, transaction_type, description) " +
                    "VALUES (" + str(user_id) + ", " + str(amount) + ", 'top_up', 'Пополнение через Robokassa #" + str(inv_id) + "')"
                )
                
                conn.commit()
                cur.close()
                conn.close()
            except Exception as e:
                pass
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'text/plain'},
        'isBase64Encoded': False,
        'body': f'OK{inv_id}'
    }