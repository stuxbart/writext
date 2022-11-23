import json
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

User_model = get_user_model()


class GetUSerInfoTestCase(TestCase):
    def setUp(self):
        user = User_model.objects.create(username="user1", email="user1@test.com")
        user.set_password("user1")
        user.save()

    def testResponse(self):
        get_user_data_path = reverse("accounts:user-info")
        response = self.client.get(path=get_user_data_path)
        self.assertEqual(200, response.status_code)

    def testAuthenticatedResponse(self):
        get_user_data_path = reverse("accounts:user-info")
        self.client.login(username="user1@test.com", password="user1")
        response = self.client.get(path=get_user_data_path)
        res_dict = json.loads(response.content)

        self.assertEqual(200, response.status_code)
        self.assertEqual(
            res_dict,
            {
                "username": "user1",
                "email": "user1@test.com",
                "isAuthenticated": True,
                "error": "",
            },
        )
