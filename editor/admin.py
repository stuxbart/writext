from django.contrib import admin

from .models import (
    Project,
    Folder,
    FolderUserPermissions,
    ProjectUserPermissions,
    UserProjectSettings,
    SourceFile,
    MediaFile,
    FileVersion,
    VersionsRelation,
    FileChange,
    CompiledFile,
)

admin.site.register(Project)
admin.site.register(UserProjectSettings)
admin.site.register(Folder)
admin.site.register(FolderUserPermissions)
admin.site.register(ProjectUserPermissions)
admin.site.register(SourceFile)
admin.site.register(MediaFile)
admin.site.register(FileVersion)
admin.site.register(VersionsRelation)
admin.site.register(FileChange)
admin.site.register(CompiledFile)
