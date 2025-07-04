import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';

// Disable PDF.js worker for Vite compatibility - this will use the main thread
// This is slower but more reliable in browser environments
GlobalWorkerOptions.workerSrc = null;

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log('Starting PDF extraction for file:', file.name, 'Size:', file.size);
    console.log('Using main thread (no worker) for PDF processing...');
    
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
    console.log('PDF extraction completed successfully. Total text length:', finalText.length);
    console.log('Final extracted text preview:', finalText.substring(0, 500) + (finalText.length > 500 ? '...' : ''));
    
    return finalText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}