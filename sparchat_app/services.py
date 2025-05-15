# services.py
import os
import re
import secrets
import smtplib
import sqlite3
from email.mime.text import MIMEText
import openai
from django.conf import settings
import time
from rest_framework import serializers

# Load environment variables
OPENAI_API_KEY = settings.SPARCHAT_OPENAI_API_KEY
ASSISTANT_ID = settings.SPARCHAT_ASST_ID
EMAIL_SENDER = settings.SPARCHAT_SENDER_EMAIL
EMAIL_PASSWORD = settings.SPARCHAT_SENDER_PASSWORD

openai.api_key = OPENAI_API_KEY
client = openai.OpenAI(api_key=OPENAI_API_KEY)

# In-memory storage for temporary codes
TEMP_CODES = {}

class UserManager:
    def __init__(self, db_path=None):
        self.db_path = db_path or settings.BASE_DIR / 'user_emails.db'
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY)")
            conn.commit()

    def is_registered(self, email):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            return cursor.fetchone() is not None

    def register(self, email):
        if not re.match(r"^[\w\.-]+@g\.batstate-u\.edu\.ph$", email):
            raise serializers.ValidationError("Please use a valid Batangas State University email.")

        if self.is_registered(email):
            raise serializers.ValidationError("This email is already registered.")

        code = self._generate_code()
        TEMP_CODES[email] = (code, time.time())
        EmailService.send(email, "SparChat Verification Code", f"Your verification code is: {code}")
        return code

    def confirm(self, email, user_code):
        record = TEMP_CODES.get(email)
        if not record:
            return False
        code, timestamp = record
        if time.time() - timestamp > 300:  # 5 minutes
            TEMP_CODES.pop(email, None)
            return False
        if code == user_code:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("INSERT OR IGNORE INTO users VALUES (?)", (email,))
                conn.commit()
            TEMP_CODES.pop(email, None)
            return True
        return False

    def login_request(self, email):
        if not self.is_registered(email):
            return None
        otp = self._generate_code()
        TEMP_CODES[email] = (otp, time.time())
        EmailService.send(email, "Your OTP", f"Your one-time password is: {otp}")
        return otp

    def verify_login(self, email, otp):
        record = TEMP_CODES.get(email)
        if not record:
            return False
        code, timestamp = record
        if time.time() - timestamp > 300:  # 5 minutes
            TEMP_CODES.pop(email, None)
            return False
        if otp == code:
            TEMP_CODES.pop(email, None)
            return True
        return False

    def _generate_code(self):
        return str(secrets.randbelow(10**6)).zfill(6)

class EmailService:
    @staticmethod
    def send(to_email, subject, message):
        msg = MIMEText(message)
        msg["Subject"] = subject
        msg["From"] = EMAIL_SENDER
        msg["To"] = to_email
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)

class SparChatService:
    def __init__(self):
        self.client = client
        self.assistant_id = ASSISTANT_ID

    def start_chat(self):
        thread = self.client.beta.threads.create(
            messages=[{"role": "user", "content": "Hello!"}]
        )
        run = self.client.beta.threads.runs.create_and_poll(
            thread_id=thread.id,
            assistant_id=self.assistant_id
        )
        messages = list(self.client.beta.threads.messages.list(thread_id=thread.id, run_id=run.id))
        return thread.id, self._extract_text(messages)

    def continue_chat(self, thread_id, user_query):
        self.client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=user_query
        )
        run = self.client.beta.threads.runs.create_and_poll(
            thread_id=thread_id,
            assistant_id=self.assistant_id
        )
        messages = list(self.client.beta.threads.messages.list(thread_id=thread_id, run_id=run.id))
        return self._extract_text(messages)

    def _extract_text(self, messages):
        content = messages[0].content[0].text
        for ann in content.annotations:
            content.value = content.value.replace(ann.text, "")
        return content.value