'''
Business: Create payment through YooKassa and return payment URL
Args: event with httpMethod, body (amount, description, order_id)
Returns: HTTP response with payment confirmation URL
'''

import json
import os
import uuid
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
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
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        amount = body_data.get('amount')
        description = body_data.get('description', 'Оплата заказа')
        order_id = body_data.get('order_id', str(uuid.uuid4()))
        
        if not amount:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Amount is required'}),
                'isBase64Encoded': False
            }
        
        shop_id = os.environ.get('YUKASSA_SHOP_ID')
        secret_key = os.environ.get('YUKASSA_SECRET_KEY')
        
        if not shop_id or not secret_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Payment system not configured'}),
                'isBase64Encoded': False
            }
        
        import requests
        from requests.auth import HTTPBasicAuth
        
        idempotence_key = str(uuid.uuid4())
        
        payment_data = {
            'amount': {
                'value': str(amount),
                'currency': 'RUB'
            },
            'confirmation': {
                'type': 'redirect',
                'return_url': f'{event.get("headers", {}).get("origin", "https://example.com")}/payment-success'
            },
            'capture': True,
            'description': description,
            'metadata': {
                'order_id': order_id
            },
            'receipt': {
                'customer': {
                    'email': body_data.get('email', 'customer@example.com')
                },
                'items': [{
                    'description': description,
                    'quantity': '1',
                    'amount': {
                        'value': str(amount),
                        'currency': 'RUB'
                    },
                    'vat_code': 1,
                    'payment_mode': 'full_payment',
                    'payment_subject': 'service'
                }]
            }
        }
        
        response = requests.post(
            'https://api.yookassa.ru/v3/payments',
            json=payment_data,
            headers={
                'Idempotence-Key': idempotence_key,
                'Content-Type': 'application/json'
            },
            auth=HTTPBasicAuth(shop_id, secret_key),
            timeout=10
        )
        
        if response.status_code == 200:
            payment_response = response.json()
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'payment_id': payment_response['id'],
                    'confirmation_url': payment_response['confirmation']['confirmation_url'],
                    'status': payment_response['status']
                }),
                'isBase64Encoded': False
            }
        else:
            return {
                'statusCode': response.status_code,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Payment creation failed', 'details': response.text}),
                'isBase64Encoded': False
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
