# serializers.py
from rest_framework import serializers

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    user_code = serializers.CharField(max_length=6)

class LoginRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class LoginVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

class ChatSerializer(serializers.Serializer):
    thread_id = serializers.CharField()
    message = serializers.CharField()