import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';

// Try multiple worker sources as fallbacks
const workerSources = [
  'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.3.31/pdf.worker.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.3.31/build/pdf.worker.min.js'
];

// Set initial worker source
GlobalWorkerOptions.workerSrc = workerSources[0];

export async function extractTextFromPDF(file: File): Promise<string> {
  let lastError: Error | null = null;
  
  // Try each worker source until one works
  for (let i = 0; i < workerSources.length; i++) {
    try {
      console.log(`Attempting PDF extraction with worker source ${i + 1}/${workerSources.length}:`, workerSources[i]);
      GlobalWorkerOptions.workerSrc = workerSources[i];
      
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
      console.log('PDF extraction completed successfully. Total text length:', finalText.length);
      console.log('Final extracted text preview:', finalText.substring(0, 500) + (finalText.length > 500 ? '...' : ''));
      
      return finalText;
    } catch (error) {
      console.error(`PDF extraction failed with worker source ${i + 1}:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // If this isn't the last worker source, continue to next one
      if (i < workerSources.length - 1) {
        console.log('Trying next worker source...');
        continue;
      }
    }
  }
  
  // If all worker sources failed, throw the last error
  console.error('All PDF worker sources failed. Last error:', lastError);
  throw new Error(`Failed to extract text from PDF: ${lastError?.message || 'Unknown error'}`);
}