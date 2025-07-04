import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';

// Set the PDF.js worker
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf: PDFDocumentProxy = await getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const pageText = content.items
      .map((item) => {
        if ('str' in item) {
          return item.str;
        }
        return '';
      })
      .join(' ')
      .trim();

    fullText += pageText + '\n';
  }

  return fullText.trim();
}