import os, sys, time
import win32com.client

target_dir = r"C:\Users\LATITUDE 3310 TOUCH\Documents\DOCUMENT RYAN\02_Kuliah\Semester_7\KF21518001 - Skripsi (Kelas A)\04_Instrumen dan Validasi Soal-Angket"

# 1. Clean up old unnumbered duplicate files
old_docx = os.path.join(target_dir, "Pedoman_Wawancara_Analisis_Kebutuhan_Guru.docx")
old_pdf = os.path.join(target_dir, "Pedoman_Wawancara_Analisis_Kebutuhan_Guru.pdf")
for old_f in [old_docx, old_pdf]:
    if os.path.exists(old_f):
        os.remove(old_f)
        print("Removed old duplicate:", os.path.basename(old_f))

# 2. Export all 0X_...docx to PDF via Word COM
word = win32com.client.Dispatch("Word.Application")
word.Visible = False
word.DisplayAlerts = False

try:
    docx_files = [f for f in sorted(os.listdir(target_dir)) if f.startswith("0") and f.endswith(".docx")]
    print(f"Found {len(docx_files)} instrument docx files to export to PDF.")
    
    for df in docx_files:
        in_path = os.path.join(target_dir, df)
        out_name = df.replace(".docx", ".pdf")
        out_path = os.path.join(target_dir, out_name)
        
        print(f"Exporting: {df} -> {out_name}...")
        doc = word.Documents.Open(in_path)
        # 17 = wdExportFormatPDF
        doc.ExportAsFixedFormat(
            OutputFileName=out_path,
            ExportFormat=17,
            OpenAfterExport=False,
            OptimizeFor=0, # wdExportOptimizeForPrint
            CreateBookmarks=1
        )
        doc.Close(False)
        time.sleep(0.5)
        print(f"  Successfully exported {out_name} ({os.path.getsize(out_path):,} bytes)")

finally:
    word.Quit()

print("All instrument PDFs generated successfully!")
