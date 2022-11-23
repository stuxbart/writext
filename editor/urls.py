from rest_framework.routers import SimpleRouter

from .views import ProjectViewSet, FolderViewSet, FileViewSet

router = SimpleRouter()
router.register("projects", ProjectViewSet, basename="projects")
router.register("folders", FolderViewSet, basename="folders")
router.register("files", FileViewSet, basename="files")

app_name = "editor"

urlpatterns = router.urls
