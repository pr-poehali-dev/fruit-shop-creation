'''
Business: Get all password reset codes for admin panel
Args: event with httpMethod, headers with X-User-Id
Returns: HTTP response with list of reset codes
'''
import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        headers = event.get('headers', {})
        user_id = headers.get('X-User-Id') or headers.get('x-user-id')
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized'})
            }
        
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database configuration missing'})
            }
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        user_id_int = int(user_id)
        cur.execute(f"SELECT is_admin FROM users WHERE id = {user_id_int}")
        user = cur.fetchone()
        
        if not user or not user[0]:
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Access denied. Admin only.'})
            }
        
        cur.execute("""
            SELECT 
                prc.id,
                prc.phone,
                prc.reset_code,
                prc.created_at,
                prc.used_at,
                prc.expires_at,
                u.full_name,
                u.email
            FROM password_reset_codes prc
            JOIN users u ON prc.user_id = u.id
            ORDER BY prc.created_at DESC
            LIMIT 100
        """)
        
        reset_codes = []
        for row in cur.fetchall():
            reset_codes.append({
                'id': row[0],
                'phone': row[1],
                'reset_code': row[2],
                'created_at': row[3].isoformat() if row[3] else None,
                'used_at': row[4].isoformat() if row[4] else None,
                'expires_at': row[5].isoformat() if row[5] else None,
                'user_name': row[6],
                'user_email': row[7],
                'is_expired': datetime.now() > row[5] if row[5] else False,
                'is_used': row[4] is not None
            })
        
        cur.execute("""
            SELECT 
                alc.id,
                alc.login_code,
                alc.created_at,
                alc.used_at,
                alc.expires_at,
                u.full_name,
                u.phone
            FROM admin_login_codes alc
            JOIN users u ON alc.user_id = u.id
            ORDER BY alc.created_at DESC
            LIMIT 100
        """)
        
        login_codes = []
        for row in cur.fetchall():
            login_codes.append({
                'id': row[0],
                'login_code': row[1],
                'created_at': row[2].isoformat() if row[2] else None,
                'used_at': row[3].isoformat() if row[3] else None,
                'expires_at': row[4].isoformat() if row[4] else None,
                'user_name': row[5],
                'phone': row[6],
                'is_expired': datetime.now() > row[4] if row[4] else False,
                'is_used': row[3] is not None
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'reset_codes': reset_codes,
                'login_codes': login_codes
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }