import * as XLSX from "xlsx";
import type { ParsedFile } from "../types";

export async function parseExcelFile(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
  const headers = Object.keys(rows[0] ?? {});

  return {
    rows,
    headers,
    fileName: file.name,
  };
}