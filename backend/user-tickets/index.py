import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get user's support tickets or single ticket by number
    Args: event with httpMethod, queryStringParameters containing user_id or ticket_number
    Returns: HTTP response with user tickets list or single ticket details
    '''
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
        query_params = event.get('queryStringParameters', {})
        user_id = query_params.get('user_id') if query_params else None
        ticket_number = query_params.get('ticket_number') if query_params else None
        
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database configuration missing'})
            }
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        status_map = {
            'new': 'Новое',
            'open': 'Открыто',
            'in_progress': 'В обработке',
            'resolved': 'Решено',
            'closed': 'Закрыто'
        }
        
        if ticket_number:
            cur.execute(
                """SELECT id, ticket_number, subject, message, status, priority, created_at, updated_at, category, name, attachments
                   FROM t_p77282076_fruit_shop_creation.support_tickets 
                   WHERE ticket_number = %s 
                   LIMIT 1""",
                (ticket_number,)
            )
            
            row = cur.fetchone()
            
            if not row:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': False,
                        'error': 'Ticket not found'
                    })
                }
            
            ticket = {
                'id': row[0],
                'ticket_number': row[1],
                'subject': row[2],
                'message': row[3],
                'status': row[4],
                'status_text': status_map.get(row[4], row[4]),
                'priority': row[5],
                'created_at': row[6].isoformat() if row[6] else None,
                'updated_at': row[7].isoformat() if row[7] else None,
                'category': row[8],
                'name': row[9],
                'attachments': row[10] if row[10] else []
            }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'ticket': ticket
                })
            }
        
        if not user_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'user_id or ticket_number is required'})
            }
        
        cur.execute(
            """SELECT id, ticket_number, subject, message, status, priority, created_at 
               FROM t_p77282076_fruit_shop_creation.support_tickets 
               WHERE user_id = %s 
               ORDER BY created_at DESC
               LIMIT 50""",
            (int(user_id),)
        )
        
        tickets = []
        for row in cur.fetchall():
            tickets.append({
                'id': row[0],
                'ticket_number': row[1],
                'subject': row[2],
                'message': row[3],
                'status': row[4],
                'status_text': status_map.get(row[4], row[4]),
                'priority': row[5],
                'created_at': row[6].isoformat() if row[6] else None
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'tickets': tickets,
                'count': len(tickets)
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }