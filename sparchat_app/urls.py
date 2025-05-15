from django.urls import path
from .views import (
    RegisterView, ConfirmRegisterView,
    LoginRequestView, LoginVerifyView,
    ChatStartView, ChatContinueView, LogoutView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('confirm/', ConfirmRegisterView.as_view(), name='confirm_register'),
    path('login/request/', LoginRequestView.as_view(), name='login_request'),
    path('login/verify/', LoginVerifyView.as_view(), name='login_verify'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('chat/start/', ChatStartView.as_view(), name='chat_start'),
    path('chat/continue/', ChatContinueView.as_view(), name='chat_continue'),
]