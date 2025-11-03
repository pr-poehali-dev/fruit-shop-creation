'''
Business: Get admin and user activity logs with pagination and filters
Args: event with httpMethod, queryStringParameters (type, page, limit, action_type)
Returns: HTTP response with logs data and pagination
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Accept, Cache-Control, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters', {}) or {}
    log_type = params.get('type', 'admin')
    page = int(params.get('page', '1'))
    limit = int(params.get('limit', '50'))
    action_type = params.get('action_type', '')
    
    offset = (page - 1) * limit
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if log_type == 'admin':
        count_query = 'SELECT COUNT(*) as total FROM admin_logs'
        data_query = '''
            SELECT 
                al.*,
                u1.full_name as admin_name,
                u1.phone as admin_phone,
                u2.full_name as target_user_name,
                u2.phone as target_user_phone
            FROM admin_logs al
            LEFT JOIN users u1 ON al.admin_id = u1.id
            LEFT JOIN users u2 ON al.target_user_id = u2.id
        '''
        
        if action_type:
            count_query += f" WHERE action_type = '{action_type}'"
            data_query += f" WHERE al.action_type = '{action_type}'"
        
        data_query += ' ORDER BY al.created_at DESC LIMIT ' + str(limit) + ' OFFSET ' + str(offset)
    else:
        count_query = 'SELECT COUNT(*) as total FROM user_logs'
        data_query = '''
            SELECT 
                ul.*,
                u.full_name as user_name,
                u.phone as user_phone
            FROM user_logs ul
            LEFT JOIN users u ON ul.user_id = u.id
        '''
        
        if action_type:
            count_query += f" WHERE action_type = '{action_type}'"
            data_query += f" WHERE ul.action_type = '{action_type}'"
        
        data_query += ' ORDER BY ul.created_at DESC LIMIT ' + str(limit) + ' OFFSET ' + str(offset)
    
    cur.execute(count_query)
    total_result = cur.fetchone()
    total = total_result['total'] if total_result else 0
    
    cur.execute(data_query)
    logs = cur.fetchall()
    
    cur.close()
    conn.close()
    
    logs_list = []
    for log in logs:
        log_dict = dict(log)
        if log_dict.get('created_at'):
            log_dict['created_at'] = log_dict['created_at'].isoformat()
        logs_list.append(log_dict)
    
    total_pages = (total + limit - 1) // limit if limit > 0 else 1
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({
            'logs': logs_list,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': total_pages
            }
        })
    }