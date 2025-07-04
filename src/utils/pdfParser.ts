import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';

// Set the PDF.js worker to match installed pdfjs-dist version 5.3.31
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/5.3.31/pdf.worker.min.js`;

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log('Starting PDF extraction for file:', file.name, 'Size:', file.size);
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf: PDFDocumentProxy = await getDocument({ data: arrayBuffer }).promise;
    
    console.log('PDF loaded successfully. Number of pages:', pdf.numPages);

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

      console.log(`Page ${pageNum} extracted text (${pageText.length} chars):`, pageText.substring(0, 200) + (pageText.length > 200 ? '...' : ''));
      fullText += pageText + '\n';
    }

    const finalText = fullText.trim();
    console.log('PDF extraction completed. Total text length:', finalText.length);
    console.log('Final extracted text preview:', finalText.substring(0, 500) + (finalText.length > 500 ? '...' : ''));
    
    return finalText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}