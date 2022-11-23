import React, { useEffect, useRef, useState } from "react";

import {
  selectCompilationResultLink,
  selectCompilationStatus,
  CompileStatus,
} from "../../features/editor/newEditorSlice";
import { useAppSelector } from "../../hooks";
import "./PDFViewer.scss";

function PDFViewer(): JSX.Element {
  const [lastCompileStatus, setLastCompilestatus] = useState(
    CompileStatus.InProgress
  );
  const pdfLink = useAppSelector(selectCompilationResultLink);
  const compileStatus = useAppSelector(selectCompilationStatus);
  // const compileError = useAppSelector(selectCompilationResultError);

  const viewerRef = useRef({} as HTMLDivElement);

  useEffect(() => {
    if (
      lastCompileStatus === CompileStatus.InProgress &&
      compileStatus === CompileStatus.Ready
    ) {
      (async function () {
        // We import this here so that it's only loaded during client-side rendering.
        const pdfJS = await import("pdfjs-dist/build/pdf");
        pdfJS.GlobalWorkerOptions.workerSrc =
          window.location.origin + "/static/pdf.worker.min.js";
        const pdf = await pdfJS.getDocument(pdfLink).promise;

        const pagesCount = pdf.numPages;
        viewerRef.current.textContent = "";
        for (let i = 0; i < pagesCount; i++) {
          const page = await pdf.getPage(i + 1);
          const viewport = page.getViewport({ scale: 2 });

          // Prepare canvas using PDF page dimensions.
          const canvas = document.createElement("canvas");
          // canvas.style.display = "block";
          if (canvas === undefined) return;
          const canvasContext: CanvasRenderingContext2D =
            canvas.getContext("2d")!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render PDF page into canvas context.
          const renderContext = { canvasContext, viewport };
          page.render(renderContext);
          viewerRef.current.appendChild(canvas);
        }
      })();
    } else {
      if (compileStatus === CompileStatus.InProgress) {
        setLastCompilestatus(CompileStatus.InProgress);
      }
    }
  }, [compileStatus, lastCompileStatus, pdfLink]);

  return (
    <div className="editor__pdf-viewer_container">
      <div ref={viewerRef} className="editor__pdf-viewer-view"></div>
    </div>
  );
}

export default PDFViewer;
