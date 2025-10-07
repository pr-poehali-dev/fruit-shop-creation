import json
import hashlib
import os
from typing import Dict, Any
from urllib.parse import urlencode

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Создание платежной ссылки Robokassa с корректной подписью
    Args: event - dict с httpMethod, body (amount, description, user_id)
          context - объект с request_id
    Returns: HTTP response с payment_url для редиректа
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    merchant_login = os.environ.get('ROBOKASSA_MERCHANT_LOGIN', '')
    password1 = os.environ.get('ROBOKASSA_PASSWORD1', '')
    test_mode = os.environ.get('ROBOKASSA_TEST_MODE', 'false').lower() == 'true'
    
    if not merchant_login or not password1:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Robokassa credentials not configured'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    amount = body_data.get('amount')
    description = body_data.get('description', 'Пополнение счета')
    user_id = body_data.get('user_id', '')
    
    if not amount or float(amount) <= 0:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Invalid amount'})
        }
    
    invoice_id = f"{context.request_id}_{user_id}"
    
    signature_string = f"{merchant_login}:{amount}:{invoice_id}:{password1}"
    if user_id:
        signature_string += f":Shp_UserId={user_id}"
    
    signature = hashlib.md5(signature_string.encode('utf-8')).hexdigest()
    
    base_url = 'https://auth.robokassa.ru/Merchant/Index.aspx' if not test_mode else 'https://auth.robokassa.ru/Merchant/Index.aspx'
    
    success_url = 'https://your-domain.com/robokassa-success'
    fail_url = 'https://your-domain.com/robokassa-fail'
    
    params = {
        'MerchantLogin': merchant_login,
        'OutSum': amount,
        'InvId': invoice_id,
        'Description': description,
        'SignatureValue': signature,
        'IsTest': '1' if test_mode else '0',
        'Encoding': 'utf-8',
        'Culture': 'ru'
    }
    
    if user_id:
        params['Shp_UserId'] = user_id
    
    payment_url = f"{base_url}?{urlencode(params)}"
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({
            'payment_url': payment_url,
            'invoice_id': invoice_id,
            'amount': amount
        })
    }