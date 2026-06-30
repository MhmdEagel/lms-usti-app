
import { useEffect, useRef, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function ViewPdf({
  fileUrl,
  fileName,
  onClose,
}: {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [pageWidth, setPageWidth] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth - 32;
        setPageWidth(Math.min(width, 800));
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/70" onClick={onClose}>
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-black" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-white text-sm md:text-lg font-semibold truncate max-w-[60%]">
          {fileName}
        </h2>
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <a
            href={fileUrl}
            download={fileName}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button type="button" variant="ghost" size="icon" className="text-white hover:bg-white/20 size-8 md:size-10">
              <Download className="size-4 md:size-5" />
            </Button>
          </a>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 size-8 md:size-10">
            <X className="size-4 md:size-5" />
          </Button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 flex items-start justify-center overflow-auto p-2 md:p-4" onClick={(e) => e.stopPropagation()}>
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<p className="text-white">Memuat PDF...</p>}
          error={<p className="text-white">Gagal memuat PDF</p>}
        >
          <Page
            pageNumber={pageNumber}
            width={pageWidth}
            scale={scale}
          />
        </Document>
      </div>

      <div className="flex items-center justify-center gap-2 md:gap-4 px-4 md:px-6 py-3 md:py-4 bg-black" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={scale <= 0.5}
            onClick={() => setScale((s) => Math.round((s - 0.1) * 10) / 10)}
            className="text-white hover:bg-white/20 disabled:opacity-30 size-8 md:size-10"
          >
            <ZoomOut className="size-4 md:size-5" />
          </Button>
          <span className="text-white text-xs md:text-sm min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={scale >= 3}
            onClick={() => setScale((s) => Math.round((s + 0.1) * 10) / 10)}
            className="text-white hover:bg-white/20 disabled:opacity-30 size-8 md:size-10"
          >
            <ZoomIn className="size-4 md:size-5" />
          </Button>
        </div>

        {numPages && numPages > 1 && (
          <>
            <span className="text-white/40 text-sm md:text-base">|</span>
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                className="text-white hover:bg-white/20 disabled:opacity-30 size-8 md:size-10"
              >
                <ChevronLeft className="size-4 md:size-5" />
              </Button>
              <span className="text-white text-xs md:text-sm">
                {pageNumber}/{numPages}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={pageNumber >= (numPages || 1)}
                onClick={() => setPageNumber((p) => Math.min(numPages || 1, p + 1))}
                className="text-white hover:bg-white/20 disabled:opacity-30 size-8 md:size-10"
              >
                <ChevronRight className="size-4 md:size-5" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
