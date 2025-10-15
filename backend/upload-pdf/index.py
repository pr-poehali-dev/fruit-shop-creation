'''
Business: Upload and parse PDF price list to extract plant data
Args: event with httpMethod, body (base64 PDF); context with request_id
Returns: HTTP response with parsed plant records
'''

import json
import base64
import re
from typing import Dict, Any, List
from pydantic import BaseModel, Field

class PlantRecord(BaseModel):
    name: str = Field(..., min_length=1)
    latin_name: str = ''
    category: str = ''
    price: float = Field(ge=0)
    stock: int = Field(ge=0)
    size: str = ''

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
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
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_str = event.get('body', '')
    if not body_str or body_str.strip() == '':
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'No file provided'})
        }
    
    body_data = json.loads(body_str)
    pdf_base64 = body_data.get('file', '')
    
    if not pdf_base64:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'No file provided'})
        }
    
    pdf_bytes = base64.b64decode(pdf_base64)
    pdf_text = extract_text_from_pdf(pdf_bytes)
    plants = parse_plants_from_text(pdf_text)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({
            'plants': [p.dict() for p in plants],
            'count': len(plants)
        })
    }

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    try:
        import PyPDF2
        from io import BytesIO
        
        pdf_file = BytesIO(pdf_bytes)
        reader = PyPDF2.PdfReader(pdf_file)
        
        text = ''
        for page in reader.pages:
            text += page.extract_text() + '\n'
        
        return text
    except Exception as e:
        return ''

def parse_plants_from_text(text: str) -> List[PlantRecord]:
    plants: List[PlantRecord] = []
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line or len(line) < 10:
            continue
        
        price_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:руб|₽|р)', line, re.IGNORECASE)
        if not price_match:
            continue
        
        price = float(price_match.group(1))
        
        name_part = line[:price_match.start()].strip()
        if not name_part:
            continue
        
        latin_match = re.search(r'\b([A-Z][a-z]+\s+[a-z]+)\b', name_part)
        latin_name = latin_match.group(1) if latin_match else ''
        
        name = re.sub(r'\b[A-Z][a-z]+\s+[a-z]+\b', '', name_part).strip()
        name = re.sub(r'\s+', ' ', name)
        
        if not name:
            name = name_part
        
        size_match = re.search(r'(\d+(?:-\d+)?\s*(?:см|м|л))', line, re.IGNORECASE)
        size = size_match.group(1) if size_match else ''
        
        category = ''
        if any(word in name.lower() for word in ['роза', 'розы']):
            category = 'Розы'
        elif any(word in name.lower() for word in ['тюльпан', 'тюльпаны']):
            category = 'Тюльпаны'
        elif any(word in name.lower() for word in ['лилия', 'лилии']):
            category = 'Лилии'
        elif any(word in name.lower() for word in ['орхидея', 'орхидеи']):
            category = 'Орхидеи'
        elif any(word in name.lower() for word in ['кактус', 'кактусы', 'суккулент']):
            category = 'Кактусы и суккуленты'
        else:
            category = 'Другие растения'
        
        try:
            plant = PlantRecord(
                name=name,
                latin_name=latin_name,
                category=category,
                price=price,
                stock=10,
                size=size
            )
            plants.append(plant)
        except:
            continue
    
    return plants