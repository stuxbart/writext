import io

from django.contrib.auth import login, logout
from django.contrib.auth.forms import (
    UserCreationForm,
)
from django.contrib.auth.views import LoginView, LogoutView
from django.http import HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import JSONParser, json


from .serializers import (
    UserSerializer, 
    CreateUserSerializer
)


class UserDetails(APIView):

    def get(self, request, format=None):
        """
        Return loggedin user data.
        """
        user = request.user
        if user.is_authenticated:
            serializer = UserSerializer(user)
            data = serializer.data
            data['isAuthenticated'] = True
            return Response(data)
        
        return Response({
            'isAuthenticated': False,
            'username': "",
            'email': ""
            })



@method_decorator(csrf_exempt, name='dispatch')
class LoginApiView(LoginView):
    def get_form_kwargs(self):
        """Return the keyword arguments for instantiating the form."""
        kwargs = {
            "initial": self.get_initial(),
            "prefix": self.get_prefix(),
        }

        if self.request.method in ("POST", "PUT"):
            data = dict(self.request.POST)

            stream = io.BytesIO(self.request.body)
            data_json = JSONParser().parse(stream)
            data.update(data_json)

            kwargs.update(
                {
                    "data": data,
                    "files": self.request.FILES,
                }
            )


        kwargs["request"] = self.request
        return kwargs

    def form_invalid(self, form):
        errors = form.non_field_errors()

        if self.request.content_type == "application/json":
            return JsonResponse({
                "error": errors.as_text(),
                "isAuthenticated": False,
                "username": "",
                "email": ""
            })

        return super().form_invalid(form)


    def form_valid(self, form):
        """Security check complete. Log the user in."""
        login(self.request, form.get_user())

        if self.request.content_type == "application/json":
            user = self.request.user
            return JsonResponse({
                "isAuthenticated": True,
                "username": user.username,
                "email": user.email
            })

        return HttpResponseRedirect(self.get_success_url())



@method_decorator(csrf_exempt, name='dispatch')
class LogoutApiView(LogoutView):
    # @method_decorator(never_cache)
    def dispatch(self, request, *args, **kwargs):
        logout(request)

        if self.request.content_type == "application/json":
            return JsonResponse({
                "success": True
            })

        return super().dispatch(request, *args, **kwargs)



class RegisterAPIView(GenericAPIView):
    serializer_class = CreateUserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response({
            "message": "User created succesfully, you can log in"
            # "user": UserSerializer(user).data,

        })