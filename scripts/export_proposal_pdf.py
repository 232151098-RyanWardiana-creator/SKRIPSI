import os
import sys
import time
import win32com.client

DOCX_PATH = r"C:\Users\LATITUDE 3310 TOUCH\Documents\DOCUMENT RYAN\02_Kuliah\Semester_7\KF21518001 - Skripsi (Kelas A)\03_Draft Proposal (BAB 1-3)\Proposal_Skripsi_Ryan_Wardiana_Revisi_Bimbingan_2_Draft.docx"
PDF_PATH = r"C:\Users\LATITUDE 3310 TOUCH\Documents\DOCUMENT RYAN\02_Kuliah\Semester_7\KF21518001 - Skripsi (Kelas A)\03_Draft Proposal (BAB 1-3)\Proposal_Skripsi_Ryan_Wardiana_Revisi_Bimbingan_2_Draft.pdf"

def update_and_export():
    print(f"Opening Word document: {os.path.basename(DOCX_PATH)}...")
    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False
    word.DisplayAlerts = False

    try:
        doc = word.Documents.Open(DOCX_PATH)
        
        # 1. Hapus semua komentar bimbingan yang telah diselesaikan
        comment_count = doc.Comments.Count
        if comment_count > 0:
            print(f"Found {comment_count} review comments. Deleting all comments for clean submission...")
            doc.DeleteAllComments()

        # 2. Atur posisi awal tampilan ke cover page dan zoom 70%
        try:
            doc.Characters.First.Select()
            doc.ActiveWindow.View.Type = 3 # wdPrintView
            doc.ActiveWindow.View.Zoom.Percentage = 70
            print("Set view to Print Layout, zoom 70%, and selected cover page start.")
        except Exception as e:
            print("Zoom setting note:", e)

        # 3. Simpan dokumen Word
        doc.Save()
        print(f"Document saved: {os.path.basename(DOCX_PATH)}")

        # 4. Ekspor ke PDF (wdExportFormatPDF = 17)
        print(f"Exporting to PDF: {os.path.basename(PDF_PATH)}...")
        doc.ExportAsFixedFormat(
            OutputFileName=PDF_PATH,
            ExportFormat=17,
            OpenAfterExport=False,
            OptimizeFor=0, # wdExportOptimizeForPrint
            CreateBookmarks=1 # wdExportCreateWordBookmarks
        )
        print(f"SUCCESS: Exported PDF ({os.path.getsize(PDF_PATH):,} bytes)")

    finally:
        doc.Close(False)
        word.Quit()

if __name__ == "__main__":
    update_and_export()
