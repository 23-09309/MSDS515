from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import UserManager, SparChatService
from .serializers import (
    RegisterSerializer, ConfirmSerializer,
    LoginRequestSerializer, LoginVerifySerializer, ChatSerializer)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

user_mgr = UserManager()
chat_svc = SparChatService()

class RegisterView(APIView):
    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        code = user_mgr.register(ser.validated_data['email'])
        return Response({"verification_code": code})

class ConfirmRegisterView(APIView):
    def post(self, request):
        ser = ConfirmSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ok = user_mgr.confirm(
            ser.validated_data['email'],
            ser.validated_data['user_code']
        )
        return Response({"registered": ok})

class LoginRequestView(APIView):
    def post(self, request):
        ser = LoginRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        otp = user_mgr.login_request(ser.validated_data['email'])
        if otp is None:
            return Response({"error": "Not registered"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"otp": otp})


class LoginVerifyView(APIView):
    def post(self, request):
        ser = LoginVerifySerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        email = ser.validated_data['email']
        otp = ser.validated_data['otp']

        if not user_mgr.verify_login(email, otp):
            return Response({"login_success": False}, status=400)

        user, _ = User.objects.get_or_create(username=email, defaults={"email": email})

        refresh = RefreshToken.for_user(user)
        return Response({
            'login_success': True,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"logout": True})
        except Exception as e:
            return Response({"logout": False, "error": str(e)}, status=400)


class ChatStartView(APIView):
    def get(self, request):
        thread_id, greeting = chat_svc.start_chat()
        return Response({"thread_id": thread_id, "greeting": greeting})

class ChatContinueView(APIView):
    def post(self, request):
        ser = ChatSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        resp = chat_svc.continue_chat(
            ser.validated_data['thread_id'],
            ser.validated_data['message']
        )
        return Response({"response": resp})