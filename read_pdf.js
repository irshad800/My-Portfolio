import fs from 'fs';
import PDFParser from 'pdf2json';

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFileSync('cv_text.txt', pdfParser.getRawTextContent());
    console.log('Done');
});

pdfParser.loadPDF('IRSHAD-SOFTWARE_ENGINEER.AE.pdf');
