from django.contrib import admin

from .models import (
    Project,
    ProjectGroup,
    ProjectAuthor,
    ProjectObserver,
    UserProjectSettings,
    ProjectGroupMember
)

admin.site.register(Project)
admin.site.register(ProjectGroup)
admin.site.register(ProjectAuthor)
admin.site.register(ProjectObserver)
admin.site.register(UserProjectSettings)
admin.site.register(ProjectGroupMember)