#!/usr/bin/env python3
"""
Simple HTTP server for local development of the Audio Loopback Controller.
This server allows testing the application locally with proper HTTPS support.
"""

import http.server
import socketserver
import ssl
import os
import sys
from pathlib import Path

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def create_ssl_context():
    """Create a self-signed SSL certificate for local development."""
    try:
        import subprocess
        import tempfile
        
        # Check if openssl is available
        subprocess.run(['openssl', 'version'], capture_output=True, check=True)
        
        # Create certificate directory
        cert_dir = Path('.cert')
        cert_dir.mkdir(exist_ok=True)
        
        cert_file = cert_dir / 'cert.pem'
        key_file = cert_dir / 'key.pem'
        
        # Generate certificate if it doesn't exist
        if not cert_file.exists() or not key_file.exists():
            print("Generating self-signed SSL certificate...")
            subprocess.run([
                'openssl', 'req', '-x509', '-newkey', 'rsa:4096',
                '-keyout', str(key_file), '-out', str(cert_file),
                '-days', '365', '-nodes',
                '-subj', '/C=US/ST=State/L=City/O=Organization/CN=localhost'
            ], check=True)
            print("SSL certificate generated successfully!")
        
        return str(cert_file), str(key_file)
        
    except (ImportError, subprocess.CalledProcessError, FileNotFoundError):
        print("Warning: OpenSSL not found. Running without HTTPS.")
        print("Note: Some browsers may require HTTPS for microphone access.")
        return None, None

def main():
    PORT = 8000
    
    # Check if port is available
    try:
        with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
            print(f"Server starting on port {PORT}...")
            
            # Try to set up HTTPS
            cert_file, key_file = create_ssl_context()
            
            if cert_file and key_file:
                try:
                    httpd.socket = ssl.wrap_socket(
                        httpd.socket,
                        certfile=cert_file,
                        keyfile=key_file,
                        server_side=True
                    )
                    print(f"✅ HTTPS server running at: https://localhost:{PORT}")
                    print("🔒 SSL certificate is self-signed - accept the warning in your browser")
                except Exception as e:
                    print(f"⚠️  Failed to start HTTPS server: {e}")
                    print(f"✅ HTTP server running at: http://localhost:{PORT}")
            else:
                print(f"✅ HTTP server running at: http://localhost:{PORT}")
            
            print("\n📱 Audio Loopback Controller is ready!")
            print("🌐 Open your browser and navigate to the URL above")
            print("🎤 Allow microphone permissions when prompted")
            print("\nPress Ctrl+C to stop the server")
            
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n🛑 Server stopped by user")
                
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use.")
            print("Try a different port or stop the existing server.")
        else:
            print(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 