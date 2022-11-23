from django.contrib.auth import get_user_model, password_validation
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class CreateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}, "email": {"required": True}}

    def validate_password(self, value):
        password_validation.validate_password(value, self.instance)

        return value

    def create(self, validated_data):
        user = User(email=validated_data["email"], username=validated_data["username"])

        user.set_password(validated_data["password"])
        user.save()
        return user
