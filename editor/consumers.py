import enum
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.exceptions import StopConsumer


from .models import Project, SourceFile
from .tasks import compile_project


class OperationType(enum.Enum):
    insert = "insert"
    delete = "delete"


def generate_client_id() -> int:
    return 4321324


def is_valid_operation(op: dict) -> bool:
    """
    Valid operations:
    insert = {
        type: OperationType.insert.value,
        offset: int,
        str: str,
    }
    delete = {
        type: OperationType.delete.value,
        offset: int,
        length: int
    }
    """

    if not isinstance(op["offset"], int):
        return False

    if op["type"] == OperationType.insert.value:
        if not isinstance(op["str"], str):
            return False
    elif op["type"] == OperationType.delete.value:
        if not isinstance(op["length"], int):
            return False
    else:
        return False

    return True


class EditorConsumer(WebsocketConsumer):
    """
    Consumer responsible for synchronization data of source files beetwen connected clients.
    """

    file_versions = {}

    def connect(self):
        # check if user is valid
        self.user = self.scope["user"]
        if (
            self.user.is_anonymous
            or not self.user.is_active
            or not self.user.is_authenticated
        ):
            raise StopConsumer()

        # check if projectid is valid
        self.project_uuid = self.scope["url_route"]["kwargs"]["project_id"]
        if self.project_uuid == None:
            raise StopConsumer()

        # get project object
        self.project = self.get_project()
        if self.project is None:
            raise StopConsumer()
        self.project_id = self.project.id

        # add consumer to group
        self.project_group_name = f"project_{self.project_id}"
        async_to_sync(self.channel_layer.group_add)(
            self.project_group_name, self.channel_name
        )

        self.accept()

        # generate client id
        self.client_id = generate_client_id()
        self.send(json.dumps({"clientId": self.client_id}))

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.project_group_name, self.channel_name
        )

    def receive(self, text_data):
        data = json.loads(text_data)

        # compile project
        if "compile" in data:
            if not isinstance(data["compile"], dict):
                return

            if not "fileId" in data["compile"]:
                return

            self.compile_project(data["compile"]["fileId"])
            return

        # parse file operations
        if (
            data["fileId"] is None
            or data["clientId"] is None
            or data["ver"] is None
            or data["operations"] is None
        ):
            self.send_error_message("Missing data")
            return

        if data["clientId"] != self.client_id:
            self.send_error_message("Client id didn't match")
            return

        # get file obj
        file_id = int(data["fileId"])
        file = self.get_file_from_project(file_id)
        if file is None:
            self.send_error_message("File doesn't exists")
            return

        # set latest file version owned by client
        file_ver = int(data["ver"])
        self.file_versions[file_id] = file_ver

        # apply operations on file
        for op in data["operations"]:
            # check if operation is correct
            if not is_valid_operation(op):
                continue

            try:
                # write to file
                if op["type"] == OperationType.insert.value:
                    change_obj = file.write(
                        position=op["offset"], text=op["str"], user=self.scope["user"]
                    )

                # delete text form file
                elif op["type"] == OperationType.delete.value:

                    change_obj = file.remove(
                        position=op["offset"],
                        length=op["length"],
                        user=self.scope["user"],
                    )

            except Exception as err:
                self.send_error_message(str(err))
                return

        # commit changes and send it to clients
        file.commit_changes_and_add_new_version()
        latest_version = file.get_latest_version_obj()
        res_data = latest_version.to_json()
        async_to_sync(self.channel_layer.group_send)(
            self.project_group_name,
            {"type": "send_updated_file_version", "file_id": file_id, "data": res_data},
        )

        return

    def send_message(self, msg):
        self.send(json.dumps({"type": "websocket.send", "text": msg}))

    def send_error_message(self, msg):
        self.send(text_data=json.dumps({"type": "websocket.send", "error": msg}))

    def send_updated_file_version(self, event):
        """
        Send list of all newer versions than version currently owned by the client.
        """
        file_id = event["file_id"]
        if file_id in self.file_versions:
            ver = self.file_versions[file_id]
        else:
            ver = -1
        latest_version = SourceFile.objects.get(id=file_id).get_latest_version_obj()

        versions = latest_version.get_previous_versions(ver)[:2]
        versions.pop()
        versions_serializable = [version.to_dict() for version in versions]

        self.send(
            json.dumps({"type": "websocket.send", "versions": versions_serializable})
        )

    def get_project(self):
        projects_qs = Project.objects.get_for_user(self.user)
        project_qs = projects_qs.filter(uuid=self.project_uuid)

        if project_qs.exists():
            return project_qs.first()

        return None

    def get_file_from_project(self, file_id: int):
        qs = self.project.source_files.filter(id=file_id)
        if qs.exists():
            return qs.first()
        return None

    def compile_project(self, entry_file_id: int):
        try:
            result = compile_project.apply_async(
                args=[
                    self.project_id,
                    entry_file_id,
                    self.channel_name,
                    self.project_group_name,
                ]
            )
        except Exception:
            self.send_error_message("An error occued during compilation proces.")
