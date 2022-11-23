import uuid
import pathlib
import json
from django.utils import timezone, dateformat
from django.utils.text import Truncator
from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.core.files import File as DjangoFile
from django.core.exceptions import PermissionDenied

from .managers import (
    ProjctManager,
    FolderManager,
    SourceFileManager,
    MediaFileManager,
    FileVersionManager,
)

from .fields import OrderField


User = get_user_model()


class Project(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    title = models.CharField(max_length=200, default="Example")

    owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="projects",
    )
    folder = models.ForeignKey(
        "editor.Folder",
        on_delete=models.SET_NULL,
        related_name="projects",
        null=True,
        blank=True,
    )
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    objects = ProjctManager()

    @property
    def last_updated(self):
        """
        Looking for last edit in proejct source files.
        If there is no source files return date of project creteation.

        Returns:
            datetime: date of last edit.
        """
        source_files = self.source_files.all()
        if not source_files.exists():
            return self.created
        last_updated_file = source_files.first()
        for file in source_files:
            if last_updated_file.last_updated < file.last_updated:
                last_updated_file = file
        return last_updated_file.last_updated

    def __str__(self):
        trunc = Truncator(self.title)
        df = dateformat.DateFormat(self.created)
        return f"{trunc.chars(50)} created by {self.owner} on {df.format('jS F Y H:i')}"

    def get_project_folder_path(self):
        return self.get_project_folder_relative_path()

    def get_project_folder_absolute_path(self):
        return settings.MEDIA_ROOT / "projects" / "project_{}/".format(self.uuid)

    def get_project_folder_relative_path(self):
        path = pathlib.Path("projects/project_{}/".format(self.uuid))
        return path

    def get_project_result_relative_folder_path(self):
        path = pathlib.Path("results/project_{}/".format(self.uuid))
        return path

    def get_project_result_absolute_folder_path(self):
        return settings.MEDIA_ROOT / "results" / "project_{}/".format(self.uuid)

    def create_file(self, filename, user, content=""):
        file = self.source_files.create(
            project=self, name=filename, content=content, user=user
        )
        return file

    def compile(self, entry_file=None):
        # todo
        pass

    def authors(self):
        """
        List of users with canView and canEdit permissions.

        Returns:
            User[]: Users that can edit project.
        """
        users_ids = self.user_permissions.filter(
            canView=True, canEdit=True
        ).values_list("user__id", flat=True)
        users = User.objects.filter(id__in=users_ids)
        return users

    def can_edit(self, user):
        """
        Check if given user has permission to edit project.

        Args:
            user (User): user to check

        Returns:
            bool: true or false
        """
        if not user.is_authenticated:
            return False

        return user in self.authors()

    def get_last_edit_file(self):
        """
        Search for SourceFile containing latest edit in project.
        If there is no edits, returns the latest created file.
        If project does not have any files returns None.

        Returns:
            SourceFile | None: Latest edited file.
        """
        source_files = self.source_files.all()
        if not source_files.exists():
            return None
        last_updated_file = source_files.first()
        for file in source_files:
            if last_updated_file.last_updated < file.last_updated:
                last_updated_file = file
        return last_updated_file

    def get_last_rendered_file(self):
        """
        Return the file that was used as a entry file in last project compile.
        If there is no compiled files returns None.

        Returns:
            SourceFile | None: Last rendered entry file.
        """
        qs = self.compiled_files.all().order_by("-created")
        if not qs.exists():
            return None
        return qs.first().sourcefile_set.first()


class UserProjectSettings(models.Model):
    """todo
    Store user specific project settings.
    """

    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class UserPermissions(models.Model):
    """
    Abstract model containing info about common permissions to objects
    and date of its creation and last update.
    Does not specify target object model nor user object model.
    """

    canShare = models.BooleanField(default=False)
    canEdit = models.BooleanField(default=False)
    canView = models.BooleanField(default=False)
    canDelete = models.BooleanField(default=False)
    owner = models.BooleanField(default=False)

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class FolderUserPermissions(UserPermissions):

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="folder_permissions"
    )

    folder = models.ForeignKey(
        "editor.Folder", on_delete=models.CASCADE, related_name="user_permissions"
    )

    class Meta:
        ordering = ["user", "folder"]
        unique_together = [["user", "folder"]]

    def __str__(self):
        if self.owner:
            return f"User {self.user} is an owner of a folder {self.folder}"
        else:
            perms = ""
            if self.canEdit:
                perms += "edit, "
            if self.canView:
                perms += "view, "
            if self.canDelete:
                perms += "delete, "
            if self.canShare:
                perms += "share, "
            return f"User {self.user} can: {perms or ','} a folder {self.folder}"


class ProjectUserPermissions(UserPermissions):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="project_permissions"
    )

    project = models.ForeignKey(
        "editor.Project", on_delete=models.CASCADE, related_name="user_permissions"
    )

    class Meta:
        ordering = ["user", "project"]
        unique_together = [["user", "project"]]

    def __str__(self):
        if self.owner:
            return f"User {self.user} is an owner of a project {self.project}"
        else:
            perms = ""
            if self.canEdit:
                perms += "edit, "
            if self.canView:
                perms += "view, "
            if self.canDelete:
                perms += "delete, "
            if self.canShare:
                perms += "share, "
            return f"User {self.user} can: {perms or ','} a project {self.project}"


class Folder(models.Model):
    """
    Model used for creating folder tree containing Project objects.
    Do not confuse with in project folders containing files.
    """

    title = models.CharField(max_length=200)

    users = models.ManyToManyField(
        User,
        related_name="folders",
        through="editor.FolderUserPermissions",
    )
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="owned_folders"
    )
    parent_folder = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="folders"
    )

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    objects = FolderManager()

    @property
    def is_root(self):
        if self.parent_folder == None:
            return True
        return False

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return f"{self.title}{'(root)' if self.is_root else ''}"


def file_project_path(instance, filename):
    project_folder = str(instance.project.get_project_folder_relative_path())
    return "{0}/{1}".format(project_folder, filename)


def result_file_project_path(instance, filename):
    project_folder = str(instance.project.get_project_result_relative_folder_path())
    return "{0}/{1}".format(project_folder, filename)


class File(models.Model):
    """
    Abstract class used to represent all kinds of files in file system
    that belongs to a project.
    """

    name = models.CharField(max_length=200)
    file = models.FileField(upload_to=file_project_path)
    project = models.ForeignKey(
        "editor.Project", on_delete=models.CASCADE, related_name="files"
    )
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True

    def __str__(self) -> str:
        return self.name


class SourceFile(File):
    """
    Represents text files that can be edited by user.
    Can be use as entry file to latex compilator.
    """

    project = models.ForeignKey(
        "editor.Project", on_delete=models.CASCADE, related_name="source_files"
    )
    compiled_file = models.ForeignKey(
        "editor.CompiledFile", blank=True, null=True, on_delete=models.CASCADE
    )

    objects = SourceFileManager()

    @property
    def last_updated(self):
        """Return date of last file edit or date of creation."""
        latest_ver = self.get_latest_version_obj()
        if latest_ver:
            return latest_ver.timestamp
        else:
            return self.created

    @property
    def need_compilation(self):
        """
        Check if file was edited after last compilation.

        Returns:
            bool: True if need to be compiled.
        """
        if self.compiled_file is None:
            return True

        return self.compiled_file.created < self.last_updated

    def __str__(self) -> str:
        return self.name

    def open(self):
        # todo
        pass

    def close(self):
        # todo
        pass

    # def save(self, force_insert, force_update, using, update_fields):
    #     # todo
    #     # create file or use defined source file manager
    #     return super().save(force_insert, force_update, using, update_fields)

    def delete(self, using, keep_parents):
        # todo
        # delete files from hard drive
        return super().delete(using, keep_parents)

    def get_latest_version_obj(self):
        qs = self.versions.all()

        if not qs.exists():
            return None

        qs = qs.committed()
        if not qs.exists():
            return None

        first = qs.first()
        return first

    def get_latest_uncommitted_version(self):
        qs = self.versions.all()
        if not qs.exists():
            return None

        qs = qs.uncommitted()
        if not qs.exists():
            return None

        return qs.first()

    def write(self, position: int, text: str, user=None):
        """
        Takes content and paste it into file.
        Use UTF-8 text encoding.

        Function is pretty basic and need to be changed.
        It opens file two times on every edit, once to check its size
        and once to write text into it.
        Does not use any catching.

        Args:
            position (int): Position in file where text should be inserted.
            text (str): String to insert into file.
            user (User, optional): User that edit file, used for permission checking. Defaults to None.

        Raises:
            PermissionDenied: If given user cannot edit this file.
            ValueError: If given position is out of file bounds.

        Returns:
            FileChange: Object containing info about file edit.
        """
        if not self.project.can_edit(user):
            raise PermissionDenied(
                "You do not have permission to edit files in this project."
            )

        if position < 0:
            raise ValueError(
                "Edit before file start. Position cannot be smaller than 0."
            )

        f = open(self.file.path, "r", encoding="utf-8")
        file_content = f.read()
        f.close()

        file_size = len(file_content)
        if position - 1 > file_size:
            raise ValueError("Position out of file size.")

        file_content = file_content[0:position] + text + file_content[position:]
        f = open(self.file.path, "w", encoding="utf-8")
        f.write(file_content)
        f.close()

        newest_version = self.get_latest_uncommitted_version()
        if not newest_version:
            newest_version = self.commit_changes_and_add_new_version()

        change_instance = FileChange(
            file_version=newest_version,
            position=position,
            value=text,
            type=CHANGE_TYPE_CHOICES[0][0],
            user=user,
        )
        change_instance.save()

        return change_instance

    def remove(self, position: int, length: int, user=None):
        """
        Removes text of given length at given position.
        Use UTF-8 text encoding.

        Function and need to be changed.

        Args:
            position (int): Position where removed text should start.
            length (int): Length of string to remove.
            user (User, optional): User that edit file, used for permission checking. Defaults to None.

        Raises:
            PermissionDenied: If given user cannot edit this file.
            ValueError: If given position and length is out of file bounds.

        Returns:
            FileChange: Object containing info about file edit. Keeps removed string.
        """
        if not self.project.can_edit(user):
            raise PermissionDenied(
                "You do not have permission to edit files in this project."
            )

        if position < 0:
            raise ValueError(
                "Edit before file start. Position cannot be smaller than 0."
            )

        f = open(self.file.path, "r", encoding="utf-8")
        file_content = f.read()
        f.close()

        file_size = len(file_content)

        if position + length - 1 > file_size:
            raise ValueError("Position out of file size.")

        text = file_content[position : position + length]
        file_content = file_content[0:position] + file_content[position + length :]
        f = open(self.file.path, "w", encoding="utf-8")
        f.write(file_content)
        f.close()

        newest_version = self.get_latest_uncommitted_version()
        if not newest_version:
            newest_version = self.commit_changes_and_add_new_version()

        change_instance = FileChange(
            file_version=newest_version,
            position=position,
            value=text,
            type=CHANGE_TYPE_CHOICES[1][0],
            user=user,
        )
        change_instance.save()

        return change_instance

    def read(self):
        """
        Read entire contents of file.

        Returns:
            str: Content of file.
        """
        content = ""

        with open(self.file.path, "r", encoding="utf-8") as f:
            file = DjangoFile(f)
            content = file.read()

        return content

    def get_content(self):
        return self.read()

    def get_formatted_content(self):
        """
        Split content of the file into separate lines.

        Returns:
            {int: str}: Dict of strings containing lines data.
        """
        content = {}
        lines_count = 0

        with open(self.file.path, "r", encoding="utf-8") as f:
            file = DjangoFile(f)
            lines = file.readlines()
            lines_count = len(lines)
            content = {i: lines[i].rstrip("\n") for i in range(lines_count)}

        return content

    def get_line_offsets(self):
        offsets = []

        with open(self.file.path, "r", encoding="utf-8") as f:
            file = DjangoFile(f)
            lines = file.readlines()

            tmp_offset = 0
            for line in lines:
                line_length = len(str(line))  # with new line character
                tmp_offset += line_length
                offsets.append(tmp_offset - 1)

            if len(offsets) > 0:
                offsets[-1] += 1
        return offsets

    def get_lines_count(self):
        lines_count = 0

        with open(self.file.path, "r", encoding="utf-8") as f:
            lines = f.read().split("\n")
            lines_count = len(lines)

        return lines_count

    def commit_changes_and_add_new_version(
        self, description: str = "", marge: bool = False
    ):
        """
        Takes latest version related to file and marks is as committed
        so it cannot be edited. Adds new uncommitted version where all new
        changes gonna be assigned.
        Assumes that there is only one uncommited file version, can be enchanced
        to support merging of multiple uncommited versions.

        Args:
            description (str, optional): Text assigned to commited version. Defaults to "".
            marge (bool, optional): Not used yet. Defaults to False.

        Returns:
            FileVersion: New uncommited version object.
        """

        newest_version = self.get_latest_uncommitted_version()
        if newest_version:
            newest_version.committed = True
            newest_version.timestamp = timezone.now()
            newest_version.description = description or "Commit changes"
            newest_version.save()
        else:
            newest_version = self.get_latest_version_obj()

        new_uncommitted_version = FileVersion(
            file=self, description="Uncommited version"
        )
        new_uncommitted_version.save()

        if newest_version:
            new_uncommitted_version.previous_versions.add(newest_version)

        return new_uncommitted_version


class MediaFile(File):
    """
    Model used to represent files uploaded by user.
    These files are not used as entry files to latex compilator.
    There is no file version tracking for these files.
    """

    project = models.ForeignKey(
        "editor.Project", on_delete=models.CASCADE, related_name="media_files"
    )

    objects = MediaFileManager()

    def __str__(self) -> str:
        return self.name

    def delete(self, using, keep_parents):
        # todo
        # delete files from hard drive
        return super().delete(using, keep_parents)


class CompiledFile(File):
    """
    File model used to represent compilation result PDF file.
    Keeps compilaton logs.
    """

    project = models.ForeignKey(
        "editor.Project", on_delete=models.CASCADE, related_name="compiled_files"
    )
    file = models.FileField(upload_to=result_file_project_path)
    log_file = models.FileField(upload_to=result_file_project_path)

    def __str__(self) -> str:
        return self.name


class FileVersion(models.Model):
    """
    Represent set of changes made in SourceFile object.
    Keeps relations with previous versions.
    """

    file = models.ForeignKey(
        SourceFile, on_delete=models.CASCADE, related_name="versions"
    )
    ver = OrderField(blank=True, for_fields=["file"])
    previous_versions = models.ManyToManyField(
        "self",
        through="VersionsRelation",
        through_fields=("newer", "older"),
        symmetrical=False,
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    description = models.TextField()
    committed = models.BooleanField(default=False)

    objects = FileVersionManager()

    class Meta:
        ordering = ["-ver"]

    @property
    def is_root(self):
        return not self.previous_versions.all().exists()

    def __str__(self) -> str:
        h = "(First version)" if self.is_root else ""
        return f"{self.file.name}, ver. {self.ver} {h}, at {self.timestamp}"

    def to_dict(self):
        prev_versions = tuple(
            self.previous_versions.all().values_list("ver", flat=True)
        )
        changes = [change.to_dict() for change in self.changes.all()]
        d = {
            "ver": self.ver,
            "prevVersions": prev_versions,
            "fileId": self.file.id,
            "timestamp": self.timestamp.strftime("%c"),
            # "description": self.description,
            "committed": self.committed,
            "changes": changes,
        }
        return d

    def to_json(self):
        return json.dumps(self.to_dict())

    def get_previous_versions(self, ver: int):
        """
        Iterates over previous versions looking for given version.
        Assumes that version has only one previous version. # todo

        Args:
            ver (int): Target version number.

        Returns:
            FileVersion[]: List of versions existing beetwen current version and target version.
        """
        target_version = FileVersion.objects.filter(file=self.file, ver=ver)
        if not target_version.exists():
            return []
        target_version = target_version.first()
        tmp_version = self
        l = [tmp_version]

        while tmp_version != target_version:
            prev = tmp_version.previous_versions.all()
            if not prev.exists():
                return []

            tmp_version = prev.first()
            l.append(tmp_version)

        return l


class VersionsRelation(models.Model):
    newer = models.ForeignKey(
        FileVersion, on_delete=models.CASCADE, related_name="older_versions"
    )
    older = models.ForeignKey(
        FileVersion, on_delete=models.CASCADE, related_name="newer_versions"
    )

    def __str__(self):
        return f"File: {self.newer.file.name} | Ver. {self.newer.ver} is based on ver. {self.older.ver}"


CHANGE_TYPE_CHOICES = ((1, "insertion"), (2, "removal"), (3, "replace"))


class FileChange(models.Model):
    """Model used to represent changes made in SourceFile."""

    file_version = models.ForeignKey(
        FileVersion, on_delete=models.CASCADE, related_name="changes"
    )
    position = models.PositiveIntegerField()
    value = models.TextField()
    order = OrderField(blank=True, for_fields=["file_version"])
    type = models.PositiveSmallIntegerField(choices=CHANGE_TYPE_CHOICES)
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="committed_changes"
    )

    class Meta:
        ordering = ["order"]

    def __str__(self):
        if self.type == 1:
            return f"Insert {self.value} at position {self.position}"
        elif self.type == 2:
            return f"Remove {self.value} at position {self.position}"
        elif self.type == 2:
            return f"Replace {self.value} at position {self.position}"
        else:
            return f"Wrong type"

    def to_dict(self):
        d = {
            "pos": self.position,
            "val": self.value,
            "type": self.get_type_display(),
            "user": self.user.id,
        }
        return d

    def to_json(self):
        return json.dumps(self.to_dict())
