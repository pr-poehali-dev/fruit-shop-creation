import json
import os
import requests
from typing import Dict, Any
from urllib.parse import urlencode

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Create Alfabank payment for orders and balance top-up via Alfa Checkout API
    Args: event with httpMethod, body (amount, user_id, order_id, description)
          context with request_id
    Returns: HTTP response with payment_url or error
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
    
    body_data = json.loads(event.get('body', '{}'))
    amount = body_data.get('amount')
    user_id = body_data.get('user_id')
    order_id = body_data.get('order_id')
    description = body_data.get('description', 'Оплата заказа')
    return_url = body_data.get('return_url', 'https://your-site.com/payment/success')
    
    if not amount or not user_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'amount and user_id required'}),
            'isBase64Encoded': False
        }
    
    if float(amount) <= 0:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Amount must be positive'}),
            'isBase64Encoded': False
        }
    
    username = os.environ.get('ALFABANK_USERNAME')
    password = os.environ.get('ALFABANK_PASSWORD')
    
    if not username or not password:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'Alfabank credentials not configured',
                'message': 'Необходимо добавить данные для доступа к API Альфа-Банка в настройках проекта'
            }),
            'isBase64Encoded': False
        }
    
    alfabank_api_url = 'https://web.rbsuat.com/ab/rest/register.do'
    
    amount_in_kopecks = int(float(amount) * 100)
    order_number = f"{order_id or 'topup'}_{user_id}_{context.request_id[:8]}"
    
    payload = {
        'userName': username,
        'password': password,
        'orderNumber': order_number,
        'amount': amount_in_kopecks,
        'returnUrl': return_url,
        'description': description,
        'jsonParams': json.dumps({
            'user_id': user_id,
            'order_id': order_id
        })
    }
    
    try:
        response = requests.post(alfabank_api_url, data=payload, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if 'formUrl' in data:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'payment_url': data['formUrl'],
                    'order_id': data.get('orderId'),
                    'order_number': order_number
                }),
                'isBase64Encoded': False
            }
        else:
            error_message = data.get('errorMessage', 'Unknown error from Alfabank')
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': error_message,
                    'details': data
                }),
                'isBase64Encoded': False
            }
    
    except requests.exceptions.RequestException as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'Failed to connect to Alfabank API',
                'details': str(e)
            }),
            'isBase64Encoded': False
        }