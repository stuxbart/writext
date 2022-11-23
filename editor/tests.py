from os import name
from turtle import title
from django.test import TestCase, SimpleTestCase
from django.db.utils import IntegrityError

from .models import (
    Folder, 
    FolderUserPermissions,
    User
)

# class TestingCalibration(SimpleTestCase):
#     def setUp(self):
#         pass

#     def tearDown(self):
#         pass

#     def test_pass(self):
#         """Check if True == True, Value set to True"""
#         self.assertTrue(True)

#     def test_fail(self):
#         """Check if False == False, value set to True"""
#         self.assertFalse(True)


# class ModelUnitTestCase(TestCase):
#     def setUp(self):
#         user1 = User.objects.create(
#             username='test_user1',
#             email='testing1@testing.com',
#             password='test_password1',
#             is_staff=True,
#             is_superuser=True,
#             is_active=True
#         )
#         user2 = User.objects.create(
#             username='test_user2',
#             email='testing2@testing.com',
#             password='test_password2',
#             is_staff=True,
#             is_superuser=True,
#             is_active=True
#         )
#         folder1 = Folder.objects.create(
#             title="folder 1",
#             owner=user1,
#             parent_folder=None,
#         )
#         folder2 = Folder.objects.create(
#             title="folder 2",
#             owner=user2,
#             parent_folder=None,
#         )
#         user_folder_permissions1 = FolderUserPermissions.objects.create(
#             user=user1,
#             folder=folder1,
#             canShare=True,
#             canEdit=True,
#             canView=True,
#             canDelete=True,
#             owner=True
#         )
#         user_folder_permissions2 = FolderUserPermissions.objects.create(
#             user=user2,
#             folder=folder1,
#             canShare=True,
#             canEdit=True,
#             canView=True,
#             canDelete=True,
#             owner=True
#         )
#         user_folder_permissions3 = FolderUserPermissions.objects.create(
#             user=user2,
#             folder=folder2,
#             canShare=True,
#             canEdit=True,
#             canView=True,
#             canDelete=True,
#             owner=True
#         )
        
#         # automatyczne ustawienie ownera
#         # sprawdzenie czy się nie powtarzają
#         # sprawdzenie czy mozan utworzyć dwa foldery o tej samej nazwie
    
#     def test_2(self):
#         def _test_2():
#             user2 = User.objects.get(username='test_user2')
#             folder2 = Folder.objects.get(title="folder 2")
#             FolderUserPermissions.objects.create(
#                 user=user2,
#                 folder=folder2,
#                 canShare=True,
#                 canEdit=True,
#                 canView=True,
#                 canDelete=True,
#                 owner=True
#             )
#         self.assertRaises(IntegrityError, _test_2)


#     def test_1(self):
#         user1 = User.objects.get(username='test_user1')
#         user2 = User.objects.get(username='test_user2')
#         self.assertEqual(user1.folder_permissions.all().count(), 1)
#         self.assertEqual(user2.folder_permissions.all().count(), 2)