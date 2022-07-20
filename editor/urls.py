from rest_framework.routers import SimpleRouter
from django.urls import path

from .views import (
    ProjectViewSet,
    ProjectGroupViewSet
)

router = SimpleRouter()
router.register('projects', ProjectViewSet, basename='projects')
router.register('folders', ProjectGroupViewSet, basename='folders')

app_name = 'editor'

urlpatterns = router.urls