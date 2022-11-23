import magic
from pathlib import Path
from django.http import HttpResponse
from django.contrib.auth import get_user_model
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser

from rest_framework import status

from .models import Project, Folder, ProjectUserPermissions, SourceFile, MediaFile

from .serializers import (
    ProjectSerializer,
    FolderSerialzier,
    CreateFolderSerializer,
    ProjectCreateSerializer,
    FullProjectSerialzier,
    ProjectSerializerWithPermissions,
    SourceFileSerialzier,
    MediaFileSerializer,
)

from accounts.serializers import UserSerializer

User = get_user_model()


class ProjectViewSet(ModelViewSet):
    model = Project
    permission_classes = [IsAuthenticated]
    parser_classes = (FormParser, MultiPartParser, JSONParser)
    lookup_field = "uuid"

    def get_serializer_class(self):
        if self.action == "create":
            return ProjectCreateSerializer
        if self.action == "retrieve":
            return FullProjectSerialzier
        if self.action == "list":
            return ProjectSerializerWithPermissions

        return ProjectSerializer

    def get_queryset(self):
        user = self.request.user
        return Project.objects.get_for_user(user)

    def list(self, request):
        """
        Returns list of all Project entities available to user,
        along with permissions he has to these projects.
        Additionaly sends count of entities and list of their ids.
        """
        qs = self.get_queryset()
        qs = qs.order_by("title")
        count = len(qs)

        project_all_ids = qs.values_list("uuid", flat=True)

        serilizer_class = self.get_serializer_class()
        serializer = serilizer_class(qs, many=True, context={"request": request})

        data = {"count": count, "entities": serializer.data, "allIds": project_all_ids}
        return Response(data)

    def create(self, request):
        data = request.data
        # treat -1 as a root folder
        if "folder" in data:
            if data["folder"] == -1:
                data["folder"] = None
                
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        qs = self.get_queryset()
        new_instance = qs.get(id=serializer.instance.id)
        response_serializer = ProjectSerializerWithPermissions(instance=new_instance)

        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        """todo: check if project with given name already exists in selected folder"""
        user = self.request.user
        serializer.save(owner=user)

    @action(detail=True, methods=["POST"])
    def create_file(self, request, *args, **kwargs):
        filename = request.data.get("filename", None)

        if filename is None:
            raise ValueError("Filename is required.")

        project = self.get_object()
        try:
            file = project.create_file(filename, user=self.request.user)
            response_data = SourceFileSerialzier(file).data
            return Response(response_data)
        except ValueError as err:
            return Response({"error": str(err)}, status=status.HTTP_409_CONFLICT)

    @action(detail=True, methods=["POST"])
    def share_project(self, request, *args, **kwargs):
        """
        todo: do not send list of accepted and rejected,
        generate share link
        """
        project_obj = self.get_object()
        users_emails = request.data.get("users", [])

        if not isinstance(users_emails, list):
            return Response({"error": "Incorrect data"})

        # check for users with given emails
        incorrect_emails = []
        correct_emails = []
        for user_email in users_emails:
            if not isinstance(user_email, str):
                continue

            user_qs = User.objects.filter(email=user_email)

            if not user_qs.exists():
                incorrect_emails.append(user_email)
                continue

            user = user_qs.first()

            user_permissions = ProjectUserPermissions(
                canView=True, user=user, project=project_obj
            )

            user_permissions.save()

            correct_emails.append(user_email)

        response_data = {"accepted": correct_emails, "rejected": incorrect_emails}
        return Response(response_data)

    @action(detail=True, methods=["GET"])
    def authors(self, request, *args, **kwargs):
        project_obj = self.get_object()
        users_ids = project_obj.user_permissions.filter(canView=True).values_list(
            "user__id", flat=True
        )
        users = User.objects.filter(id__in=users_ids)
        user_serializer = UserSerializer(users, many=True)
        return Response(user_serializer.data)

    @action(detail=True, methods=["POST"])
    def upload_file(self, request, *args, **kwargs):
        up_file = request.FILES.get("file", None)
        filename = request.data.get("filename", None)
        user = self.request.user

        if filename is None:
            raise ValueError("Filename is required.")
        if up_file is None:
            raise ValueError("File is not specified.")

        # todo: checking file mime type
        project = self.get_object()

        try:
            file = MediaFile.objects.create(
                name=filename, content=up_file, user=user, project=project
            )

            serializer = MediaFileSerializer(instance=file)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as err:
            return Response({"error": str(err)}, status=status.HTTP_409_CONFLICT)

    @action(detail=True, methods=["GET"], url_path="get_media_file/(?P<file_id>[^/.]+)")
    def get_media_file(self, request, file_id, *args, **kwargs):
        project_obj = self.get_object()
        file_qs = project_obj.media_files.filter(id=file_id)

        if not file_qs.exists():
            return Response(status=status.HTTP_404_NOT_FOUND)

        file = file_qs.first()
        relative_filepath = Path(file.file.name)
        absolute_file_path = (
            project_obj.get_project_folder_absolute_path() / relative_filepath.parts[-1]
        )

        if not absolute_file_path.exists():
            return Response(status=status.HTTP_404_NOT_FOUND)

        file_mime_type = "application/pdf"
        with absolute_file_path.open(mode="rb") as f:
            file_content = f.read()
            file_mime_type = magic.from_buffer(file_content, mime=True)

        r = HttpResponse(content_type=file_mime_type)
        r.write(file_content)
        return r


class FolderViewSet(ModelViewSet):
    model = Folder
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return CreateFolderSerializer

        return FolderSerialzier

    def get_queryset(self):
        user = self.request.user
        return Folder.objects.get_for_user(user)

    def list(self, request):
        qs = self.get_queryset()
        qs = qs.order_by("title")
        count = qs.count()

        folders_all_ids = qs.values_list("id", flat=True)
        folders_root_ids = qs.roots().values_list("id", flat=True)

        serilizer_class = self.get_serializer_class()
        serializer = serilizer_class(qs, many=True, context={"request": request})

        data = {
            "count": count,
            "entities": serializer.data,
            "rootIds": folders_root_ids,
            "allIds": folders_all_ids,
        }
        return Response(data)

    def create(self, request):
        data = request.data

        # treat -1 as a root folder
        if "parent_folder" in data:
            if data["parent_folder"] == -1:
                data["parent_folder"] = None

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        # check if folder with given name already exists
        title = serializer.validated_data.get("title", None)
        parent_folder = serializer.validated_data.get("parent_folder", None)
        folder_qs = self.get_queryset()
        folder_qs = folder_qs.filter(title=title, parent_folder=parent_folder)

        if folder_qs.exists():
            return Response(
                {"error": "Folder with given name already exists."},
                status=status.HTTP_409_CONFLICT,
            )

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        response_serializer = FolderSerialzier(
            serializer.instance, context={"request": request}
        )

        return Response(
            response_serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(owner=user)


class FileViewSet(ModelViewSet):
    model = SourceFile
    serializer_class = SourceFileSerialzier
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        user_projects = Project.objects.get_for_user(user)
        qs = SourceFile.objects.filter(project__in=user_projects)
        return qs

    @action(methods=["GET"], detail=True)
    def get_file_content(self, reqeust, *args, **kwargs):
        file = self.get_object()
        content = file.read(0, 5)

        response_data = {
            "plainContent": content,
            "formattedContent": file.get_formatted_content(),
            "size": file.file.size,
        }
        return Response(response_data)

    @action(methods=["GET"], detail=True)
    def get_compiled_pdf(self, request, *args, **kwargs):
        file = self.get_object()
        if file.compiled_file is None:
            return Response(
                {"error": "File was not compiled yet. Compile file and try again."},
                status=status.HTTP_404_NOT_FOUND,
            )

        project_obj = file.project
        if project_obj is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        relative_filepath = Path(file.compiled_file.file.name)
        absolute_file_path = (
            project_obj.get_project_result_absolute_folder_path()
            / relative_filepath.parts[-1]
        )
        if not absolute_file_path.exists():
            return Response(status=status.HTTP_404_NOT_FOUND)

        with absolute_file_path.open(mode="rb") as f:
            pdf = f.read()

        r = HttpResponse(content_type="application/pdf")
        r.write(pdf)
        return r
