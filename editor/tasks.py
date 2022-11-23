import uuid
import io
from pathlib import Path
from celery import shared_task
from asgiref.sync import async_to_sync
from subprocess import run
from django.urls import reverse
from django.conf import settings
from reportlab.pdfgen import canvas
from channels.layers import get_channel_layer

from .models import CompiledFile, Project


def sync_send(channel_name, consumer, value):
    """Send message to clients in websocket room."""
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.send)(
        channel_name,
        {
            "type": "send_message",
            "value": value,
        },
    )


@shared_task
def compile_project(
    project_id: int, entry_file_id: int, channel_name: str, channel_group_name: str
) -> int:
    """
    Compile project using latex compiler installed in system.
    Entry file is used as entry for compiler.

    Args:
        project_id (str): Id of project to comile.
        entry_file_id (int): Id of source file used as entry file in compilation.
        channel_name (str): Name of websocket channel where message about finished compilation process should be send.
        channel_group_name (str): Currently not used.

    Returns:
        int: Compilation status (0 - no errors, 1 - project does not exist, 2 - file does not esist, 3 - project folder does not exist, 5 - latex cannot compile project)
    """

    # check if project exists
    project_qs = Project.objects.filter(pk=project_id)
    if not project_qs.exists():
        return 1
    project_obj = project_qs.first()
    project_path = project_obj.get_project_folder_absolute_path()

    # check if given file is valid
    entry_file_qs = project_obj.source_files.filter(id=entry_file_id)
    if not entry_file_qs.exists():
        return 2
    entry_file_obj = entry_file_qs.first()

    filename = Path(entry_file_obj.file.name).parts[-1]
    filepath: Path = project_path / filename

    # check if project path exists
    if not filepath.exists():
        return 3

    # compile file
    tempdir = project_obj.get_project_result_absolute_folder_path()
    tempdir.mkdir(parents=True, exist_ok=True)

    try:
        result_filename_wo_ext = str(uuid.uuid4())
        result_filename = result_filename_wo_ext + ".pdf"
        result_file_path = Path(tempdir) / result_filename
        process = run(
            [
                "pdflatex",
                "--output-directory",
                tempdir,
                "--include-directory",
                project_path,
                "--job-name",
                result_filename_wo_ext,
                filepath,
            ]
        )
        with open(result_file_path, "rb") as f:
            pdf = f.read()

        # Create CompiledFile object
        obj = CompiledFile(name=result_filename, project=project_obj)
        relative_path = project_obj.get_project_result_relative_folder_path()
        obj.file.name = str(relative_path / result_filename)
        # todo : set log file
        obj.save()

        entry_file_obj.compiled_file = obj
        entry_file_obj.save()

    except FileNotFoundError as err:
        # If latex is not installed in system use reportlab library for testing purposes.
        if settings.DEBUG:
            # Create a file-like buffer to receive PDF data.
            buffer = io.BytesIO()

            # Create the PDF object, using the buffer as its "file."
            p = canvas.Canvas(buffer)

            # Draw things on the PDF. Here's where the PDF generation happens.
            # See the ReportLab documentation for the full list of functionality.
            p.drawString(100, 100, "Hello world." + entry_file_obj.name)

            # Close the PDF object cleanly, and we're done.
            p.showPage()
            p.save()

            # FileResponse sets the Content-Disposition header so that browsers
            # present the option to save the file.
            buffer.seek(0)

            result_filename = str(uuid.uuid4()) + ".pdf"
            result_file_path = Path(tempdir) / result_filename
            with open(result_file_path, "wb") as f:
                f.write(bytearray(buffer.getbuffer()))

            # Create CompiledFile object
            obj = CompiledFile(name=result_filename, project=project_obj)
            relative_path = project_obj.get_project_result_relative_folder_path()
            obj.file.name = str(relative_path / result_filename)
            # todo: set log file
            obj.save()

            entry_file_obj.compiled_file = obj
            entry_file_obj.save()
        else:
            return 5

    except:
        return 5

    res_data = {
        "error": "",
        "link": reverse("editor:files-get-compiled-pdf", kwargs={"pk": entry_file_id}),
    }
    # Send compilation result message with link to download pdf
    sync_send(channel_name, consumer=None, value=res_data)
    return 0


# todo
@shared_task
def delete_project_files():
    pass


@shared_task
def delete_file():
    pass
