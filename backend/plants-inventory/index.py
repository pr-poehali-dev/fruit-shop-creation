import json
import os
import base64
import re
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
from pypdf import PdfReader
from io import BytesIO

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление учётом растений (добавление, загрузка PDF, получение списка)
    Args: event с httpMethod (GET/POST), body с action (list/upload_pdf/add/update/delete)
    Returns: HTTP response с данными растений или результатом операции
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
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': 'DATABASE_URL не настроен'})
            }
        
        conn = psycopg2.connect(dsn)
        
        try:
            if method == 'GET':
                return handle_get(conn, headers)
            elif method == 'POST':
                body_data = json.loads(event.get('body', '{}'))
                action = body_data.get('action', 'list')
                
                if action == 'upload_pdf':
                    return handle_pdf_upload(conn, body_data, headers)
                elif action == 'add':
                    return handle_add_plant(conn, body_data, headers)
                elif action == 'update':
                    return handle_update_plant(conn, body_data, headers)
                elif action == 'delete':
                    return handle_delete_plant(conn, body_data, headers)
                else:
                    return handle_get(conn, headers)
            
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Метод не поддерживается'})
            }
        
        finally:
            conn.close()
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'})
        }


def handle_get(conn, headers: Dict[str, str]) -> Dict[str, Any]:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT id, name, latin_name, category, quantity, unit, 
                   price, supplier, location, notes, pdf_source,
                   created_at, updated_at
            FROM t_p77282076_fruit_shop_creation.plants_inventory
            ORDER BY created_at DESC
        ''')
        plants = cur.fetchall()
        
        result = []
        for plant in plants:
            result.append({
                'id': plant['id'],
                'name': plant['name'],
                'latin_name': plant['latin_name'],
                'category': plant['category'],
                'quantity': plant['quantity'],
                'unit': plant['unit'],
                'price': float(plant['price']) if plant['price'] else None,
                'supplier': plant['supplier'],
                'location': plant['location'],
                'notes': plant['notes'],
                'pdf_source': plant['pdf_source'],
                'created_at': plant['created_at'].isoformat() if plant['created_at'] else None,
                'updated_at': plant['updated_at'].isoformat() if plant['updated_at'] else None
            })
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'plants': result}),
            'isBase64Encoded': False
        }


def handle_pdf_upload(conn, body_data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    pdf_base64 = body_data.get('pdf_file')
    pdf_name = body_data.get('pdf_name', 'unknown.pdf')
    
    if not pdf_base64:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'PDF файл не предоставлен'})
        }
    
    try:
        pdf_bytes = base64.b64decode(pdf_base64)
        pdf_file = BytesIO(pdf_bytes)
        
        reader = PdfReader(pdf_file)
        text = ''
        for page in reader.pages:
            text += page.extract_text() + '\n'
        
        plants = parse_plants_from_text(text, pdf_name)
    except Exception as e:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': f'Ошибка чтения PDF: {str(e)}'})
        }
    
    try:
        with conn.cursor() as cur:
            inserted_count = 0
            for plant in plants:
                cur.execute('''
                    INSERT INTO t_p77282076_fruit_shop_creation.plants_inventory
                    (name, latin_name, category, quantity, unit, price, supplier, location, notes, pdf_source)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ''', (
                    plant.get('name'),
                    plant.get('latin_name'),
                    plant.get('category'),
                    plant.get('quantity', 0),
                    plant.get('unit', 'шт'),
                    plant.get('price'),
                    plant.get('supplier'),
                    plant.get('location'),
                    plant.get('notes'),
                    pdf_name
                ))
                inserted_count += 1
            
            conn.commit()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'message': f'Добавлено {inserted_count} растений из PDF',
                'count': inserted_count
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Ошибка сохранения данных: {str(e)}'}),
            'isBase64Encoded': False
        }


def parse_plants_from_text(text: str, pdf_source: str) -> List[Dict[str, Any]]:
    plants = []
    lines = text.split('\n')
    
    current_plant = {}
    
    for line in lines:
        line = line.strip()
        if not line:
            if current_plant.get('name'):
                plants.append(current_plant)
                current_plant = {}
            continue
        
        if re.match(r'^[А-ЯЁ][а-яёА-ЯЁ\s\-]+$', line) and len(line) > 3:
            if current_plant.get('name'):
                plants.append(current_plant)
            current_plant = {'name': line, 'pdf_source': pdf_source}
        
        elif re.search(r'[a-z]{3,}', line.lower()) and not current_plant.get('latin_name'):
            current_plant['latin_name'] = line
        
        price_match = re.search(r'(\d+[\.,]?\d*)\s*(руб|₽|р)', line)
        if price_match and not current_plant.get('price'):
            current_plant['price'] = float(price_match.group(1).replace(',', '.'))
        
        qty_match = re.search(r'(\d+)\s*(шт|кг|л|м)', line)
        if qty_match:
            current_plant['quantity'] = int(qty_match.group(1))
            current_plant['unit'] = qty_match.group(2)
        
        if any(keyword in line.lower() for keyword in ['цветы', 'деревья', 'кустарники', 'травы']):
            current_plant['category'] = line
        
        if 'поставщик' in line.lower():
            current_plant['supplier'] = line.replace('Поставщик:', '').replace('поставщик:', '').strip()
    
    if current_plant.get('name'):
        plants.append(current_plant)
    
    return plants


def handle_add_plant(conn, body_data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    plant = body_data.get('plant', {})
    
    with conn.cursor() as cur:
        cur.execute('''
            INSERT INTO t_p77282076_fruit_shop_creation.plants_inventory
            (name, latin_name, category, quantity, unit, price, supplier, location, notes, pdf_source)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        ''', (
            plant.get('name'),
            plant.get('latin_name'),
            plant.get('category'),
            plant.get('quantity', 0),
            plant.get('unit', 'шт'),
            plant.get('price'),
            plant.get('supplier'),
            plant.get('location'),
            plant.get('notes'),
            plant.get('pdf_source')
        ))
        
        plant_id = cur.fetchone()[0]
        conn.commit()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'id': plant_id}),
        'isBase64Encoded': False
    }


def handle_update_plant(conn, body_data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    plant_id = body_data.get('id')
    plant = body_data.get('plant', {})
    
    with conn.cursor() as cur:
        cur.execute('''
            UPDATE t_p77282076_fruit_shop_creation.plants_inventory
            SET name = %s, latin_name = %s, category = %s, quantity = %s,
                unit = %s, price = %s, supplier = %s, location = %s,
                notes = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (
            plant.get('name'),
            plant.get('latin_name'),
            plant.get('category'),
            plant.get('quantity'),
            plant.get('unit'),
            plant.get('price'),
            plant.get('supplier'),
            plant.get('location'),
            plant.get('notes'),
            plant_id
        ))
        
        conn.commit()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }


def handle_delete_plant(conn, body_data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    plant_id = body_data.get('id')
    
    with conn.cursor() as cur:
        cur.execute('''
            DELETE FROM t_p77282076_fruit_shop_creation.plants_inventory
            WHERE id = %s
        ''', (plant_id,))
        
        conn.commit()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }