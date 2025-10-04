import json
import base64
import uuid
import os
from typing import Dict, Any

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
        
        file_extension = 'jpg'
        if body_data.get('filename'):
            filename = body_data['filename'].lower()
            if filename.endswith('.png'):
                file_extension = 'png'
            elif filename.endswith('.webp'):
                file_extension = 'webp'
            elif filename.endswith('.gif'):
                file_extension = 'gif'
        
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        storage_path = f"/tmp/{unique_filename}"
        with open(storage_path, 'wb') as f:
            f.write(image_bytes)
        
        import boto3
        from botocore.client import Config
        
        s3_endpoint = os.environ.get('S3_ENDPOINT', 'https://storage.yandexcloud.net')
        s3_access_key = os.environ.get('S3_ACCESS_KEY')
        s3_secret_key = os.environ.get('S3_SECRET_KEY')
        s3_bucket = os.environ.get('S3_BUCKET', 'poehali-uploads')
        
        if not s3_access_key or not s3_secret_key:
            public_url = f"https://via.placeholder.com/800x600.{file_extension}?text=Upload+Success"
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'url': public_url,
                    'message': 'Demo mode: using placeholder'
                }),
                'isBase64Encoded': False
            }
        
        s3 = boto3.client(
            's3',
            endpoint_url=s3_endpoint,
            aws_access_key_id=s3_access_key,
            aws_secret_access_key=s3_secret_key,
            config=Config(signature_version='s3v4')
        )
        
        content_type = 'image/jpeg'
        if file_extension == 'png':
            content_type = 'image/png'
        elif file_extension == 'webp':
            content_type = 'image/webp'
        elif file_extension == 'gif':
            content_type = 'image/gif'
        
        s3.upload_file(
            storage_path,
            s3_bucket,
            f"products/{unique_filename}",
            ExtraArgs={
                'ContentType': content_type,
                'ACL': 'public-read'
            }
        )
        
        os.remove(storage_path)
        
        public_url = f"{s3_endpoint}/{s3_bucket}/products/{unique_filename}"
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'url': public_url
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
