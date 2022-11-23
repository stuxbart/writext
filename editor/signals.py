from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Project, ProjectUserPermissions, Folder, FolderUserPermissions
from .utils import get_latex_starter_template


@receiver(post_save, sender=Project, dispatch_uid="initialize_project")
def initialize_project(sender, instance, **kwargs):
    """
    Create ProjectUserPermissions to enable owner to edit project.
    Then create starter file in project.
    """

    if not kwargs["created"]:
        return

    user = instance.owner
    permissions_instance = ProjectUserPermissions.objects.create(
        canShare=True,
        canEdit=True,
        canView=True,
        canDelete=True,
        owner=True,
        user=user,
        project=instance,
    )

    instance.create_file(
        filename="main.tex",
        user=user,
        content=get_latex_starter_template(instance),
    )

    return instance


@receiver(post_save, sender=Folder, dispatch_uid="create_permissions_instance")
def create_permissions_obj_for_owner(sender, instance, **kwargs):
    """
    Create FolderUserPermissions for newly created folder an its owner.
    """

    if not kwargs["created"]:
        return

    user = instance.owner

    folder_user_permissions = FolderUserPermissions.objects.create(
        user=user,
        folder=instance,
        canShare=True,
        canEdit=True,
        canView=True,
        canDelete=True,
        owner=True,
    )
    folder_user_permissions.save()
