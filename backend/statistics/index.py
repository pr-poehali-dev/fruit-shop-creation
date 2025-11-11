import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Собирает статистику посещений сайта и предоставляет данные онлайн-счётчика
    Args: event с httpMethod, body, queryStringParameters
    Returns: HTTP response с данными статистики
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            visitor_id = body_data.get('visitor_id')
            user_agent = body_data.get('user_agent', '')
            referer = body_data.get('referer', '')
            platform = body_data.get('platform', '')
            browser = body_data.get('browser', '')
            device_type = body_data.get('device_type', '')
            
            # Записываем визит
            cur.execute('''
                INSERT INTO site_visits (visitor_id, user_agent, referer, platform, browser, device_type)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (visitor_id, user_agent, referer, platform, browser, device_type))
            
            # Обновляем онлайн-активность
            cur.execute('''
                INSERT INTO online_users (visitor_id, last_activity)
                VALUES (%s, NOW())
                ON CONFLICT (visitor_id) 
                DO UPDATE SET last_activity = NOW()
            ''', (visitor_id,))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        if method == 'GET':
            action = event.get('queryStringParameters', {}).get('action', 'online')
            
            if action == 'online':
                # Удаляем неактивных (более 5 минут)
                cur.execute('''
                    DELETE FROM online_users 
                    WHERE last_activity < NOW() - INTERVAL '5 minutes'
                ''')
                
                # Считаем онлайн
                cur.execute('SELECT COUNT(*) FROM online_users')
                online_count = cur.fetchone()[0]
                
                # Получаем настройки
                cur.execute('SELECT show_online_counter, online_boost FROM site_settings LIMIT 1')
                row = cur.fetchone()
                show_counter = row[0] if row else True
                boost = row[1] if row else 0
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'online': online_count + boost,
                        'show_counter': show_counter
                    })
                }
            
            if action == 'stats':
                # Статистика за последние 7 дней
                cur.execute('''
                    SELECT 
                        DATE(visited_at) as date,
                        COUNT(*) as visits,
                        COUNT(DISTINCT visitor_id) as unique_visitors
                    FROM site_visits
                    WHERE visited_at >= NOW() - INTERVAL '7 days'
                    GROUP BY DATE(visited_at)
                    ORDER BY date DESC
                ''')
                
                daily_stats = []
                for row in cur.fetchall():
                    daily_stats.append({
                        'date': row[0].isoformat(),
                        'visits': row[1],
                        'unique_visitors': row[2]
                    })
                
                # Статистика по платформам
                cur.execute('''
                    SELECT platform, COUNT(*) as count
                    FROM site_visits
                    WHERE visited_at >= NOW() - INTERVAL '7 days'
                    GROUP BY platform
                    ORDER BY count DESC
                ''')
                
                platform_stats = []
                for row in cur.fetchall():
                    platform_stats.append({
                        'platform': row[0],
                        'count': row[1]
                    })
                
                # Статистика по браузерам
                cur.execute('''
                    SELECT browser, COUNT(*) as count
                    FROM site_visits
                    WHERE visited_at >= NOW() - INTERVAL '7 days'
                    GROUP BY browser
                    ORDER BY count DESC
                ''')
                
                browser_stats = []
                for row in cur.fetchall():
                    browser_stats.append({
                        'browser': row[0],
                        'count': row[1]
                    })
                
                # Статистика по источникам
                cur.execute('''
                    SELECT 
                        CASE 
                            WHEN referer = '' THEN 'Прямой переход'
                            ELSE referer 
                        END as source,
                        COUNT(*) as count
                    FROM site_visits
                    WHERE visited_at >= NOW() - INTERVAL '7 days'
                    GROUP BY source
                    ORDER BY count DESC
                    LIMIT 10
                ''')
                
                referer_stats = []
                for row in cur.fetchall():
                    referer_stats.append({
                        'source': row[0],
                        'count': row[1]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'daily': daily_stats,
                        'platforms': platform_stats,
                        'browsers': browser_stats,
                        'referers': referer_stats
                    })
                }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()
