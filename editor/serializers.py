from dataclasses import fields
from rest_framework import serializers

from .models import (
    Project,
    ProjectGroup,
    ProjectGroupMember
)

class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.CharField(source="owner.email")
    newChanges = serializers.BooleanField(default=True)
    todo = serializers.BooleanField(default=True)
    
    groups = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 
            'title', 
            'owner', 
            'created', 
            'updated', 
            'newChanges', 
            'todo',
            'groups'
        ]

    def get_groups(self, obj):
        user = self.context['request'].user
        return obj.groups.get_for_user(user).values_list('id', flat=True)


class CreateProjectGroupSerializer(serializers.ModelSerializer):
   
    class Meta:
        model = ProjectGroup
        fields = [
            'owner',
            'title',
            'parent_group'
        ]

        extra_kwargs = {
            'owner': {
                'required': False
            },
            'parent_group': {
                'required': False
            }
        }


class ProjectGroupSerializer(serializers.ModelSerializer):
    # parent_folder_id = serializers.IntegerField(source="parent_group__id")

    class Meta:
        model = ProjectGroup
        fields = [
            'id', 
            'title', 
            'child_groups',
            'projects',
            'parent_group'
        ]

    