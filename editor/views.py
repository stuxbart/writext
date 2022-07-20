from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from django.contrib.auth.mixins import LoginRequiredMixin

from .models import (
    Project,
    ProjectGroup
)

from .serializers import (
    ProjectSerializer,
    ProjectGroupSerializer,
    CreateProjectGroupSerializer,
)

class ProjectViewSet(ModelViewSet):
    model = Project

    def get_serializer_class(self):
        return ProjectSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Project.objects.get_for_user(user)
        
        return qs


class ProjectGroupViewSet(ModelViewSet):
    model = ProjectGroup

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateProjectGroupSerializer
        return ProjectGroupSerializer

    def get_queryset(self):
        user = self.request.user
        qs = ProjectGroup.objects.get_for_user(user)
        
        return qs

    def list(self, request):
        qs = self.get_queryset()
        qs = qs.order_by('title')
        project_group_all_ids = qs.values_list('id', flat=True)
        project_group_root_ids = qs.roots().values_list('id', flat=True)
        count = qs.count()
        
        serilizer_class = self.get_serializer_class()
        serializer = serilizer_class(qs, many=True)

        data = {
            "count": count,
            "entities": serializer.data,
            "rootIds": project_group_root_ids,
            "allIds": project_group_all_ids
        }
        return Response(data)

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(owner=user)