import io
from dataclasses import dataclass, asdict, field

from django.contrib.auth import login, logout
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.forms import AuthenticationForm
from django.http import HttpResponseRedirect, JsonResponse, HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import JSONParser
from rest_framework.views import status
from rest_framework.status import HTTP_401_UNAUTHORIZED, HTTP_200_OK

from .serializers import UserSerializer, CreateUserSerializer


@dataclass
class Messages:
    user_successfully_created: str = "Your account has been created."
    user_creation_deined: str = "Something went wrong, try to create your account again."
    user_not_authenticated: str = "You have to log in."
    login_error: str = "Given username or password are incorrect."


@dataclass
class UserResponseData:
    isAuthenticated: bool = False
    username: str = ""
    email: str = ""
    error: str = ""


@dataclass
class LogoutResponseData:
    success: bool = True


@dataclass
class RegisterResponseData:
    message: str = ""
    errors: dict = field(default_factory=dict)


class UserDetails(APIView):
    def get(self, request) -> Response:
        """
        Returns UserResponseData as json dict.
        If authenticated set authenticated user data.
        In other case set error message.
        """
        user = self.request.user
        response_data = UserResponseData()

        if user.is_authenticated:
            serializer = UserSerializer(user)
            response_data.username = serializer.data["username"]
            response_data.email = serializer.data["email"]
            response_data.isAuthenticated = True
        else:
            response_data.error = Messages.user_not_authenticated
            Response(asdict(response_data), status=HTTP_401_UNAUTHORIZED)

        return Response(asdict(response_data))


class LoginApiView(LoginView):
    """
    Allows to log in user via credentials provided as json data.
    """

    def get_form_kwargs(self) -> dict:
        """
        Return the keyword arguments for instantiating the login form.
        Parse request body data for application/json requests.
        """

        kwargs = super().get_form_kwargs()
        if self.request.content_type == "application/json" and self.request.method in (
            "POST",
            "PUT",
        ):
            stream = io.BytesIO(self.request.body)
            data_json = JSONParser().parse(stream)
            kwargs["data"] = data_json

        kwargs["request"] = self.request
        return kwargs

    def form_invalid(self, form: AuthenticationForm) -> HttpResponse:
        """
        Return an error string for application/json requests,
        otherwise call default django LogiView.form_invalid() method.
        """
        errors = form.non_field_errors()

        if self.request.content_type == "application/json":
            response_data = UserResponseData(
                error=Messages.login_error or errors.as_text()
            )
            return JsonResponse(asdict(response_data), status=HTTP_401_UNAUTHORIZED)

        return super().form_invalid(form)

    def form_valid(self, form: AuthenticationForm) -> HttpResponse:
        """
        Log in the user after security checks.
        Returns UserResponseData if request content type is application/json.
        """
        user = form.get_user()
        login(self.request, user)

        if self.request.content_type == "application/json":
            response_data = UserResponseData(
                isAuthenticated=True, username=user.username, email=user.email
            )
            return JsonResponse(asdict(response_data), status=HTTP_200_OK)

        return HttpResponseRedirect(self.get_success_url())


class LogoutApiView(LogoutView):
    """
    Logout current user.
    If application/json request then returns LogoutResponseData.
    """

    def dispatch(self, request, *args, **kwargs) -> HttpResponse:
        logout(request)

        if self.request.content_type == "application/json":
            return JsonResponse(asdict(LogoutResponseData()), status=HTTP_200_OK)

        return super().dispatch(request, *args, **kwargs)


class RegisterAPIView(GenericAPIView):
    """
    Allows to create new account via api.
    Returns RegisterResponseData with success message if account was created correctly.
    Otherwise returns RegisterResponseData with error messaegs.
    """

    serializer_class = CreateUserSerializer

    def post(self, request, *args, **kwargs) -> HttpResponse:
        serializer = self.get_serializer(data=request.data)
        is_valid = serializer.is_valid(raise_exception=False)

        if is_valid:
            serializer.save()
            response_data = RegisterResponseData(
                message=Messages.user_successfully_created
            )
            return Response(asdict(response_data), status=status.HTTP_201_CREATED)

        response_data = RegisterResponseData(
            message=Messages.user_creation_deined, errors=dict(serializer.errors)
        )
        return Response(asdict(response_data), status=status.HTTP_406_NOT_ACCEPTABLE)
