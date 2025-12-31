"""
Flask 后端：同时托管静态页面 + 代理转发到 Kimi API。
启动方式（命令行执行）：

    cd E:\word-learning-system
    pip install flask requests
    python server_flask.py

然后在浏览器访问：
    http://127.0.0.1:5500/index.html        主应用
    http://127.0.0.1:5500/kimi-test.html    Kimi 测试页
"""

import os
import json

from flask import Flask, send_from_directory, request, jsonify
import requests

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    static_folder=ROOT_DIR,   # 直接把整个项目目录作为静态目录
    static_url_path=""        # 静态文件用相对路径访问，例如 /index.html /app.js
)


@app.route("/")
def index():
    """默认返回主页面 index.html"""
    return send_from_directory(ROOT_DIR, "index.html")


@app.post("/api/kimi")
def kimi_proxy():
    """
    前端调用 /api/kimi，这里转发到 Kimi 的 chat completions 接口。
    请求体 JSON 结构：
      {
        "apiKey": "...可选，不传则用环境变量 KIMI_API_KEY",
        "payload": { 原样转发给 moonshot 的 JSON }
      }
    """
    try:
        data = request.get_json(force=True, silent=False)
    except Exception as e:
        return jsonify({"error": "invalid_json", "detail": str(e)}), 400

    payload = data.get("payload") or {}
    api_key = data.get("apiKey") or os.getenv("KIMI_API_KEY", "").strip()

    if not api_key:
        return jsonify({"error": "missing_api_key", "detail": "请在前端传 apiKey 或设置环境变量 KIMI_API_KEY"}), 400

    try:
        resp = requests.post(
            "https://api.moonshot.cn/v1/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            timeout=60,
        )
    except Exception as e:
        return jsonify({"error": "network_error", "detail": str(e)}), 500

    try:
        resp_json = resp.json()
    except Exception:
        # moonshot 返回的不是 JSON，直接透传文本
        return resp.text, resp.status_code

    return jsonify(resp_json), resp.status_code


if __name__ == "__main__":
    # 使用与之前 python http.server 一样的端口，方便你继续用 5500
    port = 5500
    print(f"Flask Kimi 服务器启动中: http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)


