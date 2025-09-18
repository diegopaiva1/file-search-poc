import { Injectable, Logger } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as tesseract from 'node-tesseract-ocr';

@Injectable()
export class TextExtractionService {
  private readonly logger = new Logger(TextExtractionService.name);

  async extractText(fileBuffer: Buffer, mimeType: string, fileName: string): Promise<string> {
    try {
      switch (mimeType) {
        case 'application/pdf':
          return await this.extractFromPdf(fileBuffer);
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.extractFromDocx(fileBuffer);
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return await this.extractFromExcel(fileBuffer);
        case 'text/plain':
        case 'text/csv':
          return fileBuffer.toString('utf-8');
        case 'image/png':
        case 'image/jpeg':
        case 'image/jpg':
        case 'image/tiff':
          return await this.extractFromImage(fileBuffer);
        default:
          this.logger.warn(`Unsupported file type for text extraction: ${mimeType}`);
          return '';
      }
    } catch (error) {
      this.logger.error(`Error extracting text from ${fileName}: ${error.message}`, error.stack);
      return '';
    }
  }

  private async extractFromPdf(fileBuffer: Buffer): Promise<string> {
    const data = await pdfParse(fileBuffer);
    return data.text;
  }

  private async extractFromDocx(fileBuffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  }

  private async extractFromExcel(fileBuffer: Buffer): Promise<string> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    let text = '';

    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const sheetText = XLSX.utils.sheet_to_txt(sheet);
      text += `${sheetName}:\n${sheetText}\n\n`;
    });

    return text;
  }

  private async extractFromImage(fileBuffer: Buffer): Promise<string> {
    try {
      const tempFilePath = join('/tmp', `temp-${Date.now()}.png`);
      await fs.writeFile(tempFilePath, fileBuffer);

      const text = await tesseract.recognize(tempFilePath, {
        lang: 'eng',
        oem: 1,
        psm: 3,
      });

      await fs.unlink(tempFilePath);
      return text;
    } catch (error) {
      this.logger.error(`OCR extraction failed: ${error.message}`);
      return '';
    }
  }
}