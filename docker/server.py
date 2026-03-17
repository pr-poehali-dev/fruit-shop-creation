"""
FastAPI adapter that wraps all serverless backend functions
and exposes them as HTTP endpoints.
"""

import json
import os
import sys
import importlib.util
from typing import Any
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

sys.path.insert(0, "/app/backend")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FUNCTION_MAP = {
    "auth": "auth",
    "auth-api": "auth-api",
    "admin-get-logs": "admin-get-logs",
    "admin-update-profile": "admin-update-profile",
    "alfabank-payment": "alfabank-payment",
    "alfabank-webhook": "alfabank-webhook",
    "approvals-api": "approvals-api",
    "categories": "categories",
    "clear-all-data": "clear-all-data",
    "collect-logs": "collect-logs",
    "content-manager": "content-manager",
    "dashboard-api": "dashboard-api",
    "delivery-zones": "delivery-zones",
    "dictionaries-api": "dictionaries-api",
    "favorites": "favorites",
    "google-auth": "google-auth",
    "invoice-ocr": "invoice-ocr",
    "log-analyzer": "log-analyzer",
    "loyalty-card": "loyalty-card",
    "main": "main",
    "monitoring": "monitoring",
    "notifications": "notifications",
    "notifications-api": "notifications-api",
    "orders": "orders",
    "password-reset": "password-reset",
    "payments-api": "payments-api",
    "plants-inventory": "plants-inventory",
    "process-scheduled-payments": "process-scheduled-payments",
    "products": "products",
    "push-notifications": "push-notifications",
    "ratings": "ratings",
    "savings-api": "savings-api",
    "settings": "settings",
    "statistics": "statistics",
    "stats-api": "stats-api",
    "support": "support",
    "support-chat": "support-chat",
    "tickets-api": "tickets-api",
    "upload-image": "upload-image",
    "user-tickets": "user-tickets",
    "users-api": "users-api",
}

_handlers = {}


def load_handler(function_name: str):
    if function_name in _handlers:
        return _handlers[function_name]

    folder = FUNCTION_MAP.get(function_name)
    if not folder:
        return None

    module_path = f"/app/backend/{folder}/index.py"
    if not os.path.exists(module_path):
        return None

    spec = importlib.util.spec_from_file_location(
        f"backend_{function_name.replace('-', '_')}",
        module_path
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    handler = getattr(module, "handler", None)
    _handlers[function_name] = handler
    return handler


class FakeContext:
    def __init__(self, request_id: str = "local-docker"):
        self.request_id = request_id
        self.function_name = "docker"
        self.memory_limit_in_mb = 512
        self.invoked_function_arn = "arn:local:docker"


async def build_event(request: Request) -> dict:
    try:
        raw_body = await request.body()
        body = raw_body.decode("utf-8") if raw_body else ""
    except Exception:
        body = ""

    headers = dict(request.headers)

    query_params = dict(request.query_params)

    event = {
        "httpMethod": request.method,
        "path": request.url.path,
        "headers": headers,
        "queryStringParameters": query_params if query_params else {},
        "body": body,
        "isBase64Encoded": False,
        "requestContext": {
            "identity": {
                "sourceIp": request.client.host if request.client else "127.0.0.1"
            }
        }
    }

    return event


def patch_s3_urls(body: str) -> str:
    """Replace cloud S3 CDN URLs with local MinIO URLs"""
    public_url = os.environ.get("S3_PUBLIC_URL", "http://localhost:9000")
    return body


def make_response(result: dict) -> Response:
    status_code = result.get("statusCode", 200)
    headers = result.get("headers", {})
    body = result.get("body", "")

    if not isinstance(body, str):
        body = json.dumps(body)

    body = patch_s3_urls(body)

    response_headers = {}
    for k, v in headers.items():
        if k.lower() not in ("content-length",):
            response_headers[k] = v

    response_headers["Access-Control-Allow-Origin"] = "*"
    response_headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    response_headers["Access-Control-Allow-Headers"] = "Content-Type, X-User-Id, X-Auth-Token, X-Session-Id, Authorization"

    content_type = response_headers.get("Content-Type", "application/json")

    return Response(
        content=body,
        status_code=status_code,
        headers=response_headers,
        media_type=content_type,
    )


@app.api_route("/{function_name}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
@app.api_route("/{function_name}/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy(function_name: str, request: Request, path: str = ""):
    if request.method == "OPTIONS":
        return Response(
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token, X-Session-Id, Authorization",
                "Access-Control-Max-Age": "86400",
            }
        )

    handler = load_handler(function_name)
    if not handler:
        return JSONResponse(
            status_code=404,
            content={"error": f"Function '{function_name}' not found"},
            headers={"Access-Control-Allow-Origin": "*"}
        )

    event = await build_event(request)
    context = FakeContext()

    try:
        result = handler(event, context)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": str(e)},
            headers={"Access-Control-Allow-Origin": "*"}
        )

    return make_response(result)


@app.get("/health")
async def health():
    return {"status": "ok", "functions": list(FUNCTION_MAP.keys())}