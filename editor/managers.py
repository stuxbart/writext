from django.db import models
from django.db.models import OuterRef, Subquery
from django.apps import apps as django_apps
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist, PermissionDenied
from editor.utils import get_latex_new_file_template


User = get_user_model()


class ProjectQuerySet(models.QuerySet):
    def with_permissions(self, user):
        """
        Append user permissions to Project.
        """
        if not user.is_authenticated:
            return self.none()

        permissions_qs = user.project_permissions.filter(project=OuterRef("id"))
        return (
            self.annotate(isOwner=Subquery(permissions_qs.values("owner")[:1]))
            .annotate(canShare=Subquery(permissions_qs.values("canShare")[:1]))
            .annotate(canEdit=Subquery(permissions_qs.values("canEdit")[:1]))
            .annotate(canView=Subquery(permissions_qs.values("canView")[:1]))
            .annotate(canDelete=Subquery(permissions_qs.values("canDelete")[:1]))
        )


class ProjctManager(models.Manager):
    def get_queryset(self):
        return ProjectQuerySet(self.model, using=self._db)

    def get_for_user(self, user):
        """
        Returns Project objects available for given user, both owned and shered.
        Additionaly appends user permissions to this objects.
        """
        if not user.is_authenticated:
            return self.none()

        project_ids = (
            user.project_permissions.filter(canView=True)
            .distinct()
            .values_list("project__id", flat=True)
        )

        return (
            self.get_queryset()
            .filter(id__in=project_ids)
            .with_permissions(user)
            .distinct()
        )


class FolderQuerySet(models.QuerySet):
    def roots(self):
        """
        Return folders that have no parent folder.
        """
        return self.filter(parent_folder=None)


class FolderManager(models.Manager):
    def get_queryset(self):
        return FolderQuerySet(self.model, using=self._db)

    def get_for_user(self, user):
        """
        Return folders available for user.
        """
        if not user.is_authenticated:
            return self.none()

        return self.get_queryset().filter(owner=user)

    def roots(self):
        """
        Return folders that have no parent folder.
        """
        return self.get_queryset().roots()


class SourceFileManager(models.Manager):
    def create(self, *args, **kwargs):
        """
        Create SourceFile object with corrensponding tex source file on disk.
        Provides default tex file template if file content is not provided.
        Check if a given user has permissions to create new file in particular project.
        Params:
            project
            name
            user
            content: optional

        Raises:
            ValueError: If project, name or user was not provided.
            ObjectDoesNotExist: If project with given id does not exist.
            TypeError: If project is different type than Project or int.
            PermissionDenied: If given user does not have access to selected project.

        Returns:
            SourceFile: instance of created source file.
        """
        if not "project" in kwargs:
            raise ValueError("Project is required")
        if not "name" in kwargs:
            raise ValueError("Name is required")
        if not "user" in kwargs:
            raise ValueError("User is required")

        name = kwargs["name"]
        project = kwargs["project"]
        user = kwargs["user"]
        # get project object
        Project = django_apps.get_model("editor.Project")
        project_obj = None
        if isinstance(project, int):
            project_qs = Project.objects.filter(id=project)
            if project_qs.exists():
                project_obj = project_qs.first()
            else:
                raise ObjectDoesNotExist("Project with given id does not exist")

        elif isinstance(project, Project):
            project_obj = project
        else:
            raise TypeError("Project is wrong type")

        # check if user has permission to create files in the project
        ProjectUserPermissions = django_apps.get_model("editor.ProjectUserPermissions")
        permissions_qs = ProjectUserPermissions.objects.filter(
            user=user, project=project_obj, canEdit=True
        )

        if not permissions_qs.exists():
            raise PermissionDenied("User can't create new files in this project.")

        # get project folder paths
        absolute_path = project_obj.get_project_folder_absolute_path()
        relative_path = project_obj.get_project_folder_relative_path()

        # make filename
        filename = ""
        if name.endswith(".tex"):
            filename = name
        else:
            filename = name + ".tex"

        filepath = absolute_path / filename

        # check if file with given filename already exists
        project_source_files = project_obj.source_files.filter(name=filename)
        if project_source_files.exists():
            raise ValueError("File with given filename already exists.")

        # create project directory if didn't exists yet
        absolute_path.mkdir(parents=True, exist_ok=True)
        obj = self.model(name=filename, project=project_obj)

        # create file on a disk
        with filepath.open(mode="w") as f:
            obj.file.name = str(relative_path / filename)

        obj.save(using=self._db)

        # write content or basic file template
        content = kwargs["content"] or get_latex_new_file_template(filename)
        obj.write(position=0, text=content, user=user)

        obj.commit_changes_and_add_new_version(description="add start file template")

        return obj


class MediaFileManager(models.Manager):
    def create(self, **kwargs):
        """
        Create MediaFile object and save "content" as a file on disk with "name".
        Check if a given user has permissions to create new file in particular project.
        Params:
            project
            name
            user
            content
        """
        if not "project" in kwargs:
            raise ValueError("Project is required")
        if not "name" in kwargs:
            raise ValueError("Name is required")
        if not "user" in kwargs:
            raise ValueError("User is required")
        if not "content" in kwargs:
            raise ValueError("File content is required")

        name = kwargs["name"]
        project = kwargs["project"]
        user = kwargs["user"]
        content = kwargs["content"]

        # get project object
        Project = django_apps.get_model("editor.Project")
        project_obj = None
        if isinstance(project, int):
            project_qs = Project.objects.filter(id=project)
            if project_qs.exists():
                project_obj = project_qs.first()
            else:
                raise ObjectDoesNotExist("Project with given id does not exist")

        elif isinstance(project, Project):
            project_obj = project
        else:
            raise TypeError("Project is wrong type")

        # check if user has permission to create files in the project
        ProjectUserPermissions = django_apps.get_model("editor.ProjectUserPermissions")
        permissions_qs = ProjectUserPermissions.objects.filter(
            user=user, project=project_obj, canEdit=True
        )

        if not permissions_qs.exists():
            raise PermissionDenied("User can't create new files in this project.")

        absolute_path = project_obj.get_project_folder_absolute_path()
        relative_path = project_obj.get_project_folder_relative_path()

        filename = name
        filepath = absolute_path / filename

        # check if file with given filename already exists
        project_source_files = project_obj.media_files.filter(name=filename)
        if project_source_files.exists():
            raise ValueError("File with given filename already exists.")

        # create project directory if didn't exists yet
        absolute_path.mkdir(parents=True, exist_ok=True)

        obj = self.model(name=name, project=project_obj)
        with filepath.open(mode="wb") as f:
            for chunk in content.chunks():
                f.write(chunk)

            obj.file.name = str(relative_path / filename)

        obj.save(using=self._db)

        return obj


class FileVersionQuerySet(models.QuerySet):
    def committed(self):
        return self.filter(committed=True)

    def uncommitted(self):
        return self.filter(committed=False)


class FileVersionManager(models.Manager):
    def get_queryset(self):
        return FileVersionQuerySet(self.model, using=self._db)

    def committed(self):
        return self.get_queryset().committed()

    def uncommitted(self):
        return self.get_queryset().uncommitted()
