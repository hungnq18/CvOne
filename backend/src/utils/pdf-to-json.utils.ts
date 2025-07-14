const PDF2JSON = require("pdf2json");
const PDFParser = PDF2JSON.PDFParser || PDF2JSON.default || PDF2JSON;

function decodeText(textObj: any) {
  if (textObj && textObj.R && Array.isArray(textObj.R)) {
    textObj.R = textObj.R.map((r: any) => ({
      ...r,
      T: decodeURIComponent(r.T),
    }));
  }
  return textObj;
}

export function pdfBufferToDecodedJson(buffer: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => {
      // Giải mã text
      if (pdfData && pdfData.Pages) {
        pdfData.Pages = pdfData.Pages.map((page: any) => {
          // Giải mã text
          if (page.Texts) {
            page.Texts = page.Texts.map(decodeText);
          }
          // Hình ảnh và bảng đã nằm trong page.Images, page.Fills, page.Boxsets nếu có
          return page;
        });
      }
      resolve(pdfData);
    });
    pdfParser.parseBuffer(buffer);
  });
} 