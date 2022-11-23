def get_latex_starter_template(project):
    """Template used for first file in new project.
    todo: use django templating framework.
    """
    if project == None:
        return "Wrong project obj"

    return """\
\\documentclass{article}

\\usepackage[polish]{babel}
\\usepackage[utf8]{inputenc}
\\usepackage[T1, T2A]{fontenc}


\\begin{document}
\\section{%s}

Projekt stworzony przy pomocy edytora writext.


\\end{document}
""" % (
        project.title
    )


def get_latex_new_file_template(filename=""):
    """Template used for new file.
    todo
    """
    return f"""New file -> {filename}"""
