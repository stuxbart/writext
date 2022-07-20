from django.utils import timezone, dateformat
from django.utils.text import Truncator
from django.db import models
from django.contrib.auth import get_user_model


from .managers import (
    ProjectAuthorManager,
    ProjectGroupManager,
    ProjctManager
)

MAX_DEPTH = 2

User = get_user_model()


class ProjectGroup(models.Model):
    title = models.CharField(max_length=100)
    owner = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="project_groups"
    )
    parent_group = models.ForeignKey(
        "self", 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="child_groups"
    )
    
    projects = models.ManyToManyField(
        "editor.Project", 
        through="editor.ProjectGroupMember",
        through_fields=('project_group', 'project'),
        related_name="groups"
    )

    class Meta:
        ordering = ['title']


    objects = ProjectGroupManager()

    @property
    def is_root(self):
        if self.parent_group == None:
            return True
        return False

    @property
    def depth(self):
        i = 0
        x = self
        while x is not None:
            i += 1
            x = x.parent_group
        
        return i


    def __str__(self):
        return f"{self.title}{'(root)' if self.is_root else ''}"


    def clean(self):
        if self.parent_group is not None:
            if self.parent_group.depth > 2:
                raise Exception("Reached max level of recursion")


class Project(models.Model):
    title = models.CharField(max_length=200, default="Example")
    
    owner = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='projects',
    )
    authors = models.ManyToManyField(
        User, 
        through="editor.ProjectAuthor", 
        through_fields=('project', 'user'),
        related_name="editable_proejcts"
    )
    observers = models.ManyToManyField(
        User, 
        through="editor.ProjectObserver", 
        through_fields=('project', 'user'),
        related_name="observed_projects"
    )
    # files = models.OneToOneField()
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    objects = ProjctManager()
    # share link
    # share external link
    # share edit link
    # entry_files = models.ManyToManyField()
    # compiler
    # latex version
    # main document
    # spell check
    # auto-complete
    # auto-close bracets
    # code check
    # editor theme
    # overall theme
    # keybindings
    # font size
    # font family
    # line height
    # pdf viewer
    # github sync
    # word count
    # clone project
    # czy inni autorzy mogą zapraszać 


    # def remove_author(self): pass
    # def change_owner(self): pass
    # def add_author(self): pass
    # def generate_share_link(self): pass
    # def generate_supervisor_link(self): pass
    # def generate_download_link(self): pass
    # def compile(self): pass
    # def last_modyfied(self): pass
    # def delete(self): pass

    def __str__(self):
        trunc = Truncator(self.title)
        df = dateformat.DateFormat(self.created)
        return f"{trunc.chars(50)} utworzone przez {self.owner} dnia {df.format('jS F Y H:i')}"

    

class ProjectAuthor(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    inviter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="authors_invites",
    )
    invite_message = models.CharField(
        max_length=250, 
        null=True, 
        blank=True
    )
    accepted = models.BooleanField(default=False)
    blocked = models.BooleanField(default=False)
    created_timestamp = models.DateTimeField(auto_now_add=True)
    accepted_timestamp = models.DateTimeField()
    blocked_timestamp = models.DateTimeField()

    objects = ProjectAuthorManager()


    def accept(self):
        if self.accepted:
            return False
        
        if self.blocked:
            return False

        self.accepted = True
        self.accepted_timestamp = timezone.now()
        self.save()
        return True
            

    def block(self):
        if self.accept:
            self.accept = False
        
        self.blocked = True
        self.blocked_timestamp = timezone.now()
        self.save()
        return True

    def send_email(self): pass


    def __str__(self):
        return f"{self.user} może edytować projekt \"{str(self.project)}\""

    

class ProjectObserver(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    inviter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="observers_invites",
    )

    def __str__(self):
        return f"{self.user} może przeglądać projekt \"{str(self.project)}\""


class UserProjectSettings(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # font
    # font size
    # language


class ProjectGroupMember(models.Model):
    project_group = models.ForeignKey(ProjectGroup, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)


# todo:
# default project 'Example project' or different base on existing ones
# different title for different users
# edit history
# watch history
# archiwizacja