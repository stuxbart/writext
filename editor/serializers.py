from django.urls import reverse
from rest_framework import serializers

from .models import (
    Project,
    Folder,
    FolderUserPermissions,
    ProjectUserPermissions,
    SourceFile,
    MediaFile,
)


class ProjectPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectUserPermissions
        fields = [
            "id",
            "canShare",
            "canEdit",
            "canView",
            "canDelete",
            "owner",
            "created",
            "updated",
        ]


class ProjectSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    owner = serializers.CharField(source="owner.email", required=False)
    newChanges = serializers.BooleanField(default=False)
    todo = serializers.BooleanField(default=True)
    updated = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "owner",
            "created",
            "updated",
            "newChanges",
            "todo",
            "folder",
        ]
        extra_kwargs = {
            "owner": {"required": False},
        }

    def get_id(self, obj):
        return obj.uuid

    def get_updated(self, obj):
        return obj.last_updated


class ProjectSerializerWithPermissions(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    owner = serializers.CharField(source="owner.email", required=False)
    newChanges = serializers.BooleanField(default=False)
    todo = serializers.BooleanField(default=True)
    updated = serializers.SerializerMethodField()
    folder = serializers.SerializerMethodField("get_folder")
    isOwner = serializers.BooleanField()
    canShare = serializers.BooleanField()
    canEdit = serializers.BooleanField()
    canView = serializers.BooleanField()
    canDelete = serializers.BooleanField()

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "owner",
            "created",
            "updated",
            "newChanges",
            "todo",
            "folder",
            "isOwner",
            "canShare",
            "canEdit",
            "canView",
            "canDelete",
        ]
        extra_kwargs = {
            "owner": {"required": False},
        }

    def get_folder(self, obj):
        if obj.isOwner and obj.isOwner is not None:
            if obj.folder is not None:
                return obj.folder.id
            else:
                return obj.folder
        return None

    def get_id(self, obj):
        return obj.uuid

    def get_updated(self, obj):
        return obj.last_updated


class FullProjectSerialzier(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    owner = serializers.CharField(source="owner.email", required=False)
    newChanges = serializers.BooleanField(default=False)
    todo = serializers.BooleanField(default=True)
    updated = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()
    mediaFiles = serializers.SerializerMethodField()

    folder = serializers.SerializerMethodField("get_folder")
    isOwner = serializers.BooleanField()
    canShare = serializers.BooleanField()
    canEdit = serializers.BooleanField()
    canView = serializers.BooleanField()
    canDelete = serializers.BooleanField()

    last_edited_file = serializers.SerializerMethodField()
    last_compile_link = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "owner",
            "created",
            "updated",
            "newChanges",
            "todo",
            "folder",
            "files",
            "mediaFiles",
            "isOwner",
            "canShare",
            "canEdit",
            "canView",
            "canDelete",
            "last_edited_file",
            "last_compile_link",
        ]
        extra_kwargs = {
            "owner": {"required": False},
        }
        read_only_fields = [
            "uuid",
            "owner",
            "created",
            "updated",
            "newChanges",
            "todo",
            "folder",
            "files",
            "isOwner",
            "canShare",
            "canEdit",
            "canView",
            "canDelete",
        ]

    def get_files(self, instance):
        return SourceFileSerialzier(instance.source_files.all(), many=True).data

    def get_mediaFiles(self, instance):
        return MediaFileSerializer(instance.media_files.all(), many=True).data

    def get_folder(self, obj):
        """Only owned projects are stored in folders."""
        if obj.isOwner and obj.isOwner is not None:
            if obj.folder is not None:
                return obj.folder.id
            else:
                return obj.folder
        return None

    def get_id(self, obj):
        return obj.uuid

    def get_last_edited_file(self, obj):
        file = obj.get_last_edit_file()
        if file is not None:
            return file.id
        else:
            file_qs = obj.source_files.all()
            if not file_qs.exists():
                return -1
            return file_qs.firxt().id

    def get_last_compile_link(self, obj):
        last_compiled_source_file = obj.get_last_rendered_file()
        if last_compiled_source_file is None:
            return ""

        return reverse(
            "editor:files-get-compiled-pdf", kwargs={"pk": last_compiled_source_file.id}
        )

    def get_updated(self, obj):
        return obj.last_updated


class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["title", "owner", "folder"]
        extra_kwargs = {
            "owner": {"required": False},
        }

    def create(self, validated_data):
        instance = super().create(validated_data)
        return instance


class FolderPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FolderUserPermissions
        fields = [
            "id",
            "canShare",
            "canEdit",
            "canView",
            "canDelete",
            "owner",
            "created",
            "updated",
        ]


class FolderSerialzier(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    projects = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = [
            "id",
            "title",
            "owner",
            "parent_folder",
            "created",
            "updated",
            "is_root",
            "folders",
            "projects",
            "permissions",
        ]

        extra_kwargs = {
            "parent_folder": {"required": False},
            "updated": {"required": False},
            "created": {"required": False},
            "is_root": {"required": False},
        }

    def get_permissions(self, obj):
        user = self.context["request"].user
        perm = FolderUserPermissions.objects.filter(user=user, folder=obj)
        serializer = FolderPermissionSerializer(perm.first())
        return serializer.data

    def get_projects(self, obj):
        return obj.projects.all().values_list("uuid", flat=True)


class CreateFolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = [
            "title",
            "owner",
            "parent_folder",
        ]

        extra_kwargs = {
            "parent_folder": {"required": False},
            "owner": {"required": False},
        }

    def validate_parent_folder(self, value):
        if value == -1:  # -1 means root folder
            return None
        return value


class SourceFileSerialzier(serializers.ModelSerializer):
    size = serializers.SerializerMethodField()
    lines = serializers.SerializerMethodField()
    plainText = serializers.SerializerMethodField()
    lineOffsets = serializers.SerializerMethodField()
    linesCount = serializers.SerializerMethodField()
    ver = serializers.SerializerMethodField()
    lastUpdated = serializers.SerializerMethodField()

    class Meta:
        model = SourceFile
        fields = [
            "id",
            "name",
            "plainText",
            "lineOffsets",
            "lines",
            "project",
            "size",
            "linesCount",
            "ver",
            "lastUpdated",
        ]

    def get_size(self, obj):
        return obj.file.size

    def get_lines(self, obj):  # not need anymore
        formatted_content = obj.get_formatted_content().values()
        return formatted_content

    def get_plainText(self, obj):
        content = obj.get_content()
        return content

    def get_lineOffsets(self, obj):
        offests = obj.get_line_offsets()
        return offests

    def get_linesCount(self, obj):
        lines_count = obj.get_lines_count()
        return lines_count

    def get_ver(self, obj):
        version_obj = obj.get_latest_version_obj()
        if version_obj is None:
            return -1
        return version_obj.ver

    def get_lastUpdated(self, obj):
        return obj.last_updated


class MediaFileSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()

    class Meta:
        model = MediaFile
        fields = ["id", "name", "file"]

    def get_file(self, instance):
        """File download link."""
        return reverse(
            "editor:projects-get-media-file",
            kwargs={"uuid": instance.project.uuid, "file_id": instance.id},
        )
