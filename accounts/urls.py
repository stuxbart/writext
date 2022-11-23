from django.urls import path

from .views import UserDetails, LoginApiView, LogoutApiView, RegisterAPIView

app_name = "accounts"

urlpatterns = [
    path("user-info", UserDetails.as_view(), name="user-info"),
    path("login", LoginApiView.as_view(), name="login"),
    path("logout", LogoutApiView.as_view(), name="logout"),
    path("register", RegisterAPIView.as_view(), name="register"),
]
