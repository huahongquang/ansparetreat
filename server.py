import http.server
import socketserver
import json
import os
import re
import sys
from urllib.parse import parse_qs, urlparse

PORT = 8080
WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_JSON_PATH = os.path.join(WORKSPACE_DIR, "data.json")
DATA_JS_PATH = os.path.join(WORKSPACE_DIR, "js", "data.js")
IMG_DIR = os.path.join(WORKSPACE_DIR, "img")

class AdminHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Serve from the workspace directory
        super().__init__(*args, directory=WORKSPACE_DIR, **kwargs)

    def do_GET(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        # 1. API: Get translations and services data
        if path == "/api/data":
            self.send_json_response(self.read_data())
            return

        # 2. API: List all files in the img folder
        if path == "/api/media":
            self.send_json_response(self.list_media())
            return

        # 3. Serve Admin Panel HTML (mapped to /admin)
        if path == "/admin":
            self.path = "/admin.html"
            return super().do_GET()

        # Otherwise, delegate to standard static file serving
        return super().do_GET()

    def do_POST(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        # 0. API: Login Authentication
        if path == "/api/login":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            try:
                payload = json.loads(post_data.decode("utf-8"))
                username = payload.get("username")
                password = payload.get("password")
                
                if username == "admin" and password == "anspa2026":
                    self.send_json_response({"success": True, "token": "admin_session_token_xyz"})
                else:
                    self.send_json_response({"success": False, "error": "Sai tên đăng nhập hoặc mật khẩu!"}, 401)
            except Exception as e:
                self.send_error_response(400, f"Cú pháp đăng nhập không đúng: {e}")
            return

        # Check authorization for other write operations
        if not self.is_authorized():
            self.send_json_response({"success": False, "error": "Unauthorized. Please log in first."}, 401)
            return

        # 1. API: Save updated services and translations
        if path == "/api/data":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode("utf-8"))
                self.write_data(data)
                self.send_json_response({"success": True})
            except Exception as e:
                self.send_error_response(400, f"Invalid JSON payload: {e}")
            return

        # 2. API: Handle media file upload (multipart/form-data)
        if path == "/api/upload":
            content_type = self.headers.get("Content-Type", "")
            if not content_type.startswith("multipart/form-data"):
                self.send_error_response(400, "Content-Type must be multipart/form-data")
                return

            try:
                # Extract boundary
                boundary_match = re.search(r"boundary=(.+)", content_type)
                if not boundary_match:
                    self.send_error_response(400, "Multipart boundary not found in headers")
                    return
                boundary = boundary_match.group(1).encode("utf-8")
                
                content_length = int(self.headers.get("Content-Length", 0))
                raw_body = self.rfile.read(content_length)
                
                # Split body by boundary
                parts = raw_body.split(b"--" + boundary)
                
                uploaded_file_path = None
                for part in parts:
                    if b"Content-Disposition" not in part:
                        continue
                    
                    # Split headers and body of the part
                    header_body_split = part.split(b"\r\n\r\n", 1)
                    if len(header_body_split) < 2:
                        continue
                        
                    part_headers = header_body_split[0].decode("utf-8", errors="ignore")
                    part_body = header_body_split[1]
                    
                    # Check if it is a file upload part
                    fn_match = re.search(r'filename="([^"]+)"', part_headers)
                    if fn_match:
                        filename = fn_match.group(1)
                        # Sanitize filename (remove paths, keep extensions)
                        filename = os.path.basename(filename)
                        if not filename:
                            continue
                            
                        # Remove trailing \r\n from the part body
                        if part_body.endswith(b"\r\n"):
                            part_body = part_body[:-2]
                        if part_body.endswith(b"\r\n--"):
                            part_body = part_body[:-4]
                            
                        # Save the file
                        if not os.path.exists(IMG_DIR):
                            os.makedirs(IMG_DIR)
                            
                        dest_path = os.path.join(IMG_DIR, filename)
                        with open(dest_path, "wb") as f:
                            f.write(part_body)
                            
                        uploaded_file_path = f"img/{filename}"
                        break # Only support single file upload per request
                
                if uploaded_file_path:
                    self.send_json_response({"success": True, "filepath": uploaded_file_path})
                else:
                    self.send_error_response(400, "No file content found in request")
            except Exception as e:
                self.send_error_response(500, f"Upload error: {e}")
            return

        self.send_error_response(404, "Endpoint not found")

    def do_DELETE(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        # Check authorization for delete operations
        if not self.is_authorized():
            self.send_json_response({"success": False, "error": "Unauthorized. Please log in first."}, 401)
            return

        # 1. API: Delete media file
        if path == "/api/media":
            params = parse_qs(parsed_url.query)
            file_param = params.get("file", [None])[0]
            
            if not file_param:
                self.send_error_response(400, "Missing file parameter")
                return
                
            # Sanitize to prevent directory traversal
            clean_filename = os.path.basename(file_param)
            target_path = os.path.join(IMG_DIR, clean_filename)
            
            if os.path.exists(target_path) and os.path.isfile(target_path):
                try:
                    os.remove(target_path)
                    self.send_json_response({"success": True})
                except Exception as e:
                    self.send_error_response(500, f"Failed to delete file: {e}")
            else:
                self.send_error_response(404, "File not found or invalid path")
            return

        self.send_error_response(404, "Endpoint not found")

    # Helper: Send JSON response
    def send_json_response(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2, ensure_ascii=False).encode("utf-8"))

    # Helper: Send Error response
    def send_error_response(self, status, message):
        self.send_json_response({"success": False, "error": message}, status)

    # Helper: Check if request has valid authorization token
    def is_authorized(self):
        auth_header = self.headers.get("Authorization", "")
        if auth_header == "Bearer admin_session_token_xyz":
            return True
        return False

    # Helper: Read JSON database
    def read_data(self):
        if not os.path.exists(DATA_JSON_PATH):
            return {"translations": {}, "services": []}
        try:
            with open(DATA_JSON_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading data.json: {e}")
            return {"translations": {}, "services": []}

    # Helper: Write JSON database and sync js/data.js
    def write_data(self, data):
        # 1. Write to data.json
        with open(DATA_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        # 2. Write to js/data.js
        os.makedirs(os.path.dirname(DATA_JS_PATH), exist_ok=True)
        with open(DATA_JS_PATH, "w", encoding="utf-8") as f:
            f.write("const initialData = ")
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write(";\n")

    # Helper: List all files in img/ folder
    def list_media(self):
        if not os.path.exists(IMG_DIR):
            return []
        
        media_files = []
        try:
            for entry in os.scandir(IMG_DIR):
                if entry.is_file():
                    stat = entry.stat()
                    name = entry.name
                    ext = os.path.splitext(name)[1].lower()
                    
                    # Identify file type
                    file_type = "unknown"
                    if ext in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".jfif"]:
                        file_type = "image"
                    elif ext in [".mp4", ".mov", ".avi", ".webm"]:
                        file_type = "video"
                        
                    media_files.append({
                        "name": name,
                        "path": f"img/{name}",
                        "sizeBytes": stat.st_size,
                        "type": file_type
                    })
        except Exception as e:
            print(f"Error listing media: {e}")
            
        # Sort files alphabetically by name
        media_files.sort(key=lambda x: x["name"].lower())
        return media_files

if __name__ == "__main__":
    port_arg = PORT
    if len(sys.argv) > 1:
        try:
            port_arg = int(sys.argv[1])
        except ValueError:
            pass
            
    print(f"Starting An Spa Retreat admin backend server on http://localhost:{port_arg}")
    print(f"Serving files from: {WORKSPACE_DIR}")
    
    # Allow port re-use to prevent socket lockup on quick restarts
    class ThreadingHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
        daemon_threads = True

    ThreadingHTTPServer.allow_reuse_address = True
    with ThreadingHTTPServer(("", port_arg), AdminHTTPRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down backend server.")
