import os

port = int(os.environ.get("PORT", 5001))
bind = f"0.0.0.0:{port}"
workers = 2
threads = 4
timeout = 120
