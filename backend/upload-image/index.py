import json
import base64
import uuid
import os
from typing import Dict, Any
from io import BytesIO

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Upload product images to cloud storage
    Args: event with httpMethod, body containing base64 image
    Returns: HTTP response with image URL
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Accept, Cache-Control, X-User-Id, X-Auth-Token, X-Session-Id',
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
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        if 'image' not in body_data:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing image data'}),
                'isBase64Encoded': False
            }
        
        image_data = body_data['image']
        
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        
        from PIL import Image
        import io
        
        try:
            img = Image.open(io.BytesIO(image_bytes))
            
            if hasattr(img, '_getexif') and img._getexif() is not None:
                from PIL import ImageOps
                img = ImageOps.exif_transpose(img)
            
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Получаем параметры оптимизации из body (если переданы)
            max_width = body_data.get('max_width', 1920)
            max_height = body_data.get('max_height', 1920)
            quality = body_data.get('quality', 85)
            
            # Оптимизируем размер только если изображение больше лимитов
            if img.width > max_width or img.height > max_height:
                ratio = min(max_width / img.width, max_height / img.height)
                new_width = int(img.width * ratio)
                new_height = int(img.height * ratio)
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            output = io.BytesIO()
            img.save(output, format='JPEG', quality=quality, optimize=True)
            image_bytes = output.getvalue()
            
            optimized_size = f"{img.width}x{img.height}"
            
            file_extension = 'jpg'
            
        except Exception as e:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Invalid image format: {str(e)}'}),
                'isBase64Encoded': False
            }
        
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        storage_path = f"/tmp/{unique_filename}"
        with open(storage_path, 'wb') as f:
            f.write(image_bytes)
        
        import boto3
        
        # ⚠️ CRITICAL: Используем ТОЛЬКО эти env переменные и endpoint!
        aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
        aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
        
        if not aws_access_key or not aws_secret_key:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Storage credentials not configured'}),
                'isBase64Encoded': False
            }
        
        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',  # ⚠️ ТОЛЬКО ЭТОТ URL!
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key
        )
        
        content_type = 'image/jpeg'
        if file_extension == 'png':
            content_type = 'image/png'
        elif file_extension == 'webp':
            content_type = 'image/webp'
        elif file_extension == 'gif':
            content_type = 'image/gif'
        
        # ⚠️ Bucket ВСЕГДА 'files'!
        s3.put_object(
            Bucket='files',
            Key=f"products/{unique_filename}",
            Body=image_bytes,
            ContentType=content_type
        )
        
        os.remove(storage_path)
        
        # ⚠️ CDN URL: использовать AWS_ACCESS_KEY_ID (НЕ PROJECT_ID!)
        public_url = f"https://cdn.poehali.dev/projects/{aws_access_key}/bucket/products/{unique_filename}"
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'url': public_url,
                'optimized_size': optimized_size
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Upload failed: {str(e)}'}),
            'isBase64Encoded': False
        }