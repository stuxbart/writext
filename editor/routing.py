from django.urls import path

from .consumers import EditorConsumer

websocket_urlpatterns = [
    path("ws/editor/<project_id>/", EditorConsumer.as_asgi()),
]
