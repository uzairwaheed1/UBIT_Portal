import * as XLSX from "xlsx"

export interface ParsedStudent {
  roll_no: string
  student_name: string
  plo1: number | null
  plo2: number | null
  plo3: number | null
  plo4: number | null
  plo5: number | null
  plo6: number | null
  plo7: number | null
  plo8: number | null
  plo9: number | null
  plo10: number | null
  plo11: number | null
  plo12: number | null
}

interface ColumnHeader {
  col: number
  row: number
  name: string
}

interface ColumnMap {
  seatNo: ColumnHeader | null
  name: ColumnHeader | null
  plo1: ColumnHeader | null
  plo2: ColumnHeader | null
  plo3: ColumnHeader | null
  plo4: ColumnHeader | null
  plo5: ColumnHeader | null
  plo6: ColumnHeader | null
  plo7: ColumnHeader | null
  plo8: ColumnHeader | null
  plo9: ColumnHeader | null
  plo10: ColumnHeader | null
  plo11: ColumnHeader | null
  plo12: ColumnHeader | null
}

/**
 * Parse Excel file with intelligent header detection
 * Headers can be anywhere in the sheet, not just row 1
 */
export function parseExcelWithFlexibleHeaders(file: File): Promise<ParsedStudent[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[firstSheetName]

        // Get sheet range
        if (!sheet["!ref"]) {
          reject(new Error("Excel file appears to be empty"))
          return
        }

        const range = XLSX.utils.decode_range(sheet["!ref"])

        // Step 1: Find column headers by scanning ALL cells
        const columnMap = findColumnHeaders(sheet, range)

        // Validate required columns
        if (!columnMap.seatNo) {
          reject(
            new Error(
              'Could not find "Seat No" column. Please ensure your Excel file contains a column with header like "Seat No", "Roll No", "Student ID", or "Reg No"',
            ),
          )
          return
        }

        if (!columnMap.name) {
          reject(
            new Error(
              'Could not find "Student Name" column. Please ensure your Excel file contains a column with header like "Name of Student", "Student Name", or "Name"',
            ),
          )
          return
        }

        // Step 2: Extract student data from found columns
        const students = extractStudentData(sheet, range, columnMap)

        if (students.length === 0) {
          reject(new Error("No student data found in the Excel file. Please check the file format."))
          return
        }

        resolve(students)
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : "Unknown error"}`))
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * Find column headers by scanning all cells in the sheet
 */
function findColumnHeaders(sheet: XLSX.WorkSheet, range: XLSX.Range): ColumnMap {
  const columnMap: ColumnMap = {
    seatNo: null,
    name: null,
    plo1: null,
    plo2: null,
    plo3: null,
    plo4: null,
    plo5: null,
    plo6: null,
    plo7: null,
    plo8: null,
    plo9: null,
    plo10: null,
    plo11: null,
    plo12: null,
  }

  // Scan ALL cells to find headers
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      const cell = sheet[cellAddress]

      if (!cell || !cell.v) continue

      const cellValue = String(cell.v).trim().toLowerCase()

      // Match Seat Number / Roll Number
      if (
        !columnMap.seatNo &&
        (/^seat\s*no\.?s?\.?$/i.test(cellValue) ||
          /^roll\s*no\.?s?\.?$/i.test(cellValue) ||
          /^roll\s*number$/i.test(cellValue) ||
          /^student\s*id$/i.test(cellValue) ||
          /^reg\s*no\.?$/i.test(cellValue))
      ) {
        columnMap.seatNo = { col, row, name: String(cell.v).trim() }
        continue
      }

      // Match Student Name
      if (
        !columnMap.name &&
        (/^name\s*of\s*student$/i.test(cellValue) ||
          /^student\s*name$/i.test(cellValue) ||
          /^full\s*name$/i.test(cellValue) ||
          (/^name$/i.test(cellValue) && !columnMap.seatNo)) // Only match "Name" if Seat No is already found
      ) {
        columnMap.name = { col, row, name: String(cell.v).trim() }
        continue
      }

      // Match PLO columns (PLO-1, PLO1, PLO 1, etc.)
      const ploMatch = cellValue.match(/^plo[-\s]*(\d{1,2})$/i)
      if (ploMatch) {
        const ploNum = parseInt(ploMatch[1], 10)
        if (ploNum >= 1 && ploNum <= 12) {
          const ploKey = `plo${ploNum}` as keyof ColumnMap
          if (!columnMap[ploKey]) {
            columnMap[ploKey] = { col, row, name: String(cell.v).trim() }
          }
        }
      }
    }
  }

  return columnMap
}

/**
 * Extract student data from the sheet using the found column headers
 */
function extractStudentData(sheet: XLSX.WorkSheet, range: XLSX.Range, columnMap: ColumnMap): ParsedStudent[] {
  // Find the starting row (should be the row AFTER the last header row)
  const headerRows = [
    columnMap.seatNo?.row,
    columnMap.name?.row,
    columnMap.plo1?.row,
    columnMap.plo2?.row,
    columnMap.plo3?.row,
    columnMap.plo4?.row,
    columnMap.plo5?.row,
    columnMap.plo6?.row,
    columnMap.plo7?.row,
    columnMap.plo8?.row,
    columnMap.plo9?.row,
    columnMap.plo10?.row,
    columnMap.plo11?.row,
    columnMap.plo12?.row,
  ].filter((row) => row !== null && row !== undefined) as number[]

  const lastHeaderRow = Math.max(...headerRows)
  const dataStartRow = lastHeaderRow + 1

  const students: ParsedStudent[] = []

  // Extract data row by row starting from dataStartRow
  for (let row = dataStartRow; row <= range.e.r; row++) {
    // Get seat number (required field - if missing, stop processing)
    const seatNoCell = columnMap.seatNo
      ? sheet[XLSX.utils.encode_cell({ r: row, c: columnMap.seatNo.col })]
      : null

    // Stop if we hit an empty row (no seat number)
    if (!seatNoCell || !seatNoCell.v || String(seatNoCell.v).trim() === "") {
      continue // Skip empty rows but continue scanning
    }

    const rollNo = String(seatNoCell.v).trim()

    // Get student name
    const nameCell = columnMap.name ? sheet[XLSX.utils.encode_cell({ r: row, c: columnMap.name.col })] : null
    const studentName = nameCell && nameCell.v ? String(nameCell.v).trim() : ""

    // If both roll no and name are empty/missing, skip this row
    if (!rollNo && !studentName) {
      continue
    }

    // Initialize student object
    const student: ParsedStudent = {
      roll_no: rollNo || "",
      student_name: studentName || "",
      plo1: null,
      plo2: null,
      plo3: null,
      plo4: null,
      plo5: null,
      plo6: null,
      plo7: null,
      plo8: null,
      plo9: null,
      plo10: null,
      plo11: null,
      plo12: null,
    }

    // Extract PLO values (1-12)
    for (let ploNum = 1; ploNum <= 12; ploNum++) {
      const ploKey = `plo${ploNum}` as keyof ColumnMap
      const ploHeader = columnMap[ploKey]

      if (ploHeader) {
        const ploCell = sheet[XLSX.utils.encode_cell({ r: row, c: ploHeader.col })]
        if (ploCell && ploCell.v !== null && ploCell.v !== undefined && ploCell.v !== "") {
          const value = parseFloat(String(ploCell.v))
          if (!isNaN(value)) {
            student[ploKey as keyof ParsedStudent] = value
          }
        }
      }
    }

    students.push(student)
  }

  return students
}

