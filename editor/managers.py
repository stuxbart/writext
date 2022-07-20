from django.db import models


class ProjctManager(models.Manager):
    def get_for_user(self, user):
        if not user.is_authenticated:
            return self.none()
        
        return self.get_queryset().filter(authors__in=[user.id])


class ProjectAuthorManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()

    def get_new(self):
        return self.get_queryset().filter(new=True)


class ProjectGroupQuerySet(models.QuerySet):
    def roots(self):
        return self.filter(parent_group=None)


class ProjectGroupManager(models.Manager):
    def get_queryset(self):
        return ProjectGroupQuerySet(self.model, using=self._db)

    def get_roots(self):
        return self.get_queryset().filter(is_root=True)

    def get_for_user(self, user):
        if not user.is_authenticated:
            return self.none()
        
        return self.get_queryset().filter(owner=user.id)