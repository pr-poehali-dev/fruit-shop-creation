import json
import os
from typing import Dict, Any
import urllib.parse
import urllib.request
import base64

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Google OAuth authentication for admin access
    Args: event with httpMethod, queryStringParameters (code, state)
    Returns: HTTP response with auth token or redirect URL
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Accept, Cache-Control, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    client_id = os.environ.get('GOOGLE_CLIENT_ID')
    client_secret = os.environ.get('GOOGLE_CLIENT_SECRET')
    redirect_uri = event.get('queryStringParameters', {}).get('redirect_uri', 'https://your-domain.com/auth/callback')
    
    if method == 'GET':
        action = event.get('queryStringParameters', {}).get('action', '')
        
        if action == 'login':
            auth_url = (
                f"https://accounts.google.com/o/oauth2/v2/auth?"
                f"client_id={client_id}&"
                f"redirect_uri={urllib.parse.quote(redirect_uri)}&"
                f"response_type=code&"
                f"scope=email%20profile&"
                f"access_type=offline"
            )
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'auth_url': auth_url}),
                'isBase64Encoded': False
            }
        
        elif action == 'callback':
            code = event.get('queryStringParameters', {}).get('code', '')
            
            if not code:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'No authorization code provided'}),
                    'isBase64Encoded': False
                }
            
            token_data = {
                'code': code,
                'client_id': client_id,
                'client_secret': client_secret,
                'redirect_uri': redirect_uri,
                'grant_type': 'authorization_code'
            }
            
            token_req = urllib.request.Request(
                'https://oauth2.googleapis.com/token',
                data=urllib.parse.urlencode(token_data).encode(),
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            try:
                with urllib.request.urlopen(token_req) as response:
                    token_response = json.loads(response.read().decode())
                    access_token = token_response.get('access_token')
                    
                    user_req = urllib.request.Request(
                        'https://www.googleapis.com/oauth2/v2/userinfo',
                        headers={'Authorization': f'Bearer {access_token}'}
                    )
                    
                    with urllib.request.urlopen(user_req) as user_response:
                        user_info = json.loads(user_response.read().decode())
                        
                        import psycopg2
                        from psycopg2.extras import RealDictCursor
                        
                        db_url = os.environ.get('DATABASE_URL')
                        conn = psycopg2.connect(db_url)
                        cur = conn.cursor(cursor_factory=RealDictCursor)
                        
                        email = user_info.get('email', '')
                        name = user_info.get('name', '')
                        google_id = user_info.get('id', '')
                        
                        cur.execute(
                            f"SELECT * FROM users WHERE email = '{email}' OR google_id = '{google_id}'"
                        )
                        user = cur.fetchone()
                        
                        if user and user.get('is_admin'):
                            auth_token = base64.b64encode(f"{user['id']}:{email}".encode()).decode()
                            
                            cur.close()
                            conn.close()
                            
                            return {
                                'statusCode': 200,
                                'headers': {
                                    'Content-Type': 'application/json',
                                    'Access-Control-Allow-Origin': '*'
                                },
                                'body': json.dumps({
                                    'success': True,
                                    'user': dict(user),
                                    'auth_token': auth_token
                                }),
                                'isBase64Encoded': False
                            }
                        else:
                            cur.close()
                            conn.close()
                            
                            return {
                                'statusCode': 403,
                                'headers': {
                                    'Content-Type': 'application/json',
                                    'Access-Control-Allow-Origin': '*'
                                },
                                'body': json.dumps({
                                    'error': 'Access denied. Only administrators can log in via Google.'
                                }),
                                'isBase64Encoded': False
                            }
                            
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': f'Authentication failed: {str(e)}'}),
                    'isBase64Encoded': False
                }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }