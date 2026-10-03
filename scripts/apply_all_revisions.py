import copy
import os
import shutil
import zipfile
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

MASTER_DOCX = r"C:\Users\LATITUDE 3310 TOUCH\Documents\DOCUMENT RYAN\02_Kuliah\Semester_7\KF21518001 - Skripsi (Kelas A)\03_Draft Proposal (BAB 1-3)\Proposal_Skripsi_Ryan_Wardiana_Revisi_Bimbingan_2_Draft.docx"
BACKUP_DOCX = r"C:\Users\LATITUDE 3310 TOUCH\Documents\DOCUMENT RYAN\02_Kuliah\Semester_7\KF21518001 - Skripsi (Kelas A)\03_Draft Proposal (BAB 1-3)\Proposal_Skripsi_Ryan_Wardiana_Revisi_Bimbingan_2_Draft.docx.bak"
IMAGE_SRC = r"C:\Users\LATITUDE 3310 TOUCH\Documents\DOCUMENT RYAN\02_Kuliah\Semester_7\KF21518001 - Skripsi (Kelas A)\03_Draft Proposal (BAB 1-3)\gambar_6_1_kerangka_teoretis.png"

def backup_master():
    shutil.copy2(MASTER_DOCX, BACKUP_DOCX)
    print("1. Backup created:", BACKUP_DOCX)

def apply_image_replacement(docx_path, img_src):
    # Update word/media/image2.png in zip
    temp_docx = docx_path + ".tmp.zip"
    with zipfile.ZipFile(docx_path, 'r') as zin:
        with zipfile.ZipFile(temp_docx, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                if item.filename == "word/media/image2.png":
                    with open(img_src, 'rb') as f_img:
                        zout.writestr(item, f_img.read())
                    print("2. Replaced word/media/image2.png with new diagram!")
                else:
                    zout.writestr(item, zin.read(item.filename))
    os.replace(temp_docx, docx_path)

def reorder_do_and_kajian(docx_path):
    doc = docx.Document(docx_path)
    body = doc._element.body

    # ---------------------------------------------------------
    # PART A: REORDER DEFINISI OPERASIONAL (DO)
    # Target Order:
    # 1. Web Application LKPD Berbasis GenAI
    # 2. Generative Artificial Intelligence (GenAI) dan Large Language Model (LLM)
    # 3. Representasi Formula Matematika dan Transformasi ke Office Math Markup Language (OMML)
    # 4. Pembelajaran Berdiferensiasi dan Teaching at the Right Level (TaRL)
    # 5. Asesmen Diagnostik dan Kesiapan Belajar
    # 6. Scaffolding dan Higher Order Thinking Skills (HOTS)
    # 7. Materi Rasio dan Perbandingan
    # ---------------------------------------------------------
    do_idx = -1
    tujuan_idx = -1
    for i, el in enumerate(body):
        t = ''.join(el.itertext())
        if 'Definisi Operasional' in t and do_idx == -1 and i > 40:
            do_idx = i
        elif 'Tujuan Penelitian' in t and tujuan_idx == -1 and i > 50:
            tujuan_idx = i
            break

    print(f"DO heading at body[{do_idx}], Tujuan Penelitian at body[{tujuan_idx}]")
    intro_el = body[do_idx + 1] # Guna menghindari...

    # Identify the 7 item pairs (Heading + Paragraph)
    # Currently items are between do_idx + 2 and tujuan_idx
    items_map = {}
    curr_h = None
    curr_nodes = []
    for i in range(do_idx + 2, tujuan_idx):
        el = body[i]
        t = ''.join(el.itertext()).strip()
        if any(t.startswith(prefix) for prefix in [
            "Materi Rasio", "Asesmen Diagnostik", "Pembelajaran Berdiferensiasi",
            "Scaffolding", "Generative Artificial Intelligence",
            "Web Application", "Representasi Formula"
        ]):
            if curr_h:
                items_map[curr_h] = curr_nodes
            curr_h = t
            curr_nodes = [el]
        else:
            if curr_h:
                curr_nodes.append(el)
    if curr_h:
        items_map[curr_h] = curr_nodes

    print("Found DO items:", list(items_map.keys()))

    target_do_order = [
        "Web Application",
        "Generative Artificial Intelligence",
        "Representasi Formula",
        "Pembelajaran Berdiferensiasi",
        "Asesmen Diagnostik",
        "Scaffolding",
        "Materi Rasio"
    ]

    ordered_do_nodes = []
    for key_pattern in target_do_order:
        matched_key = None
        for k in items_map:
            if k.startswith(key_pattern):
                matched_key = k
                break
        if matched_key:
            ordered_do_nodes.extend(items_map[matched_key])
        else:
            raise ValueError(f"Could not find DO item matching: {key_pattern}")

    # Remove old DO items from body
    for k, nodes in items_map.items():
        for n in nodes:
            body.remove(n)

    # Insert ordered DO nodes right after intro_el
    insert_pos = body.index(intro_el) + 1
    for n in ordered_do_nodes:
        body.insert(insert_pos, n)
        insert_pos += 1
    print("3. Successfully reordered Definisi Operasional (DO)!")

    # ---------------------------------------------------------
    # PART B: REORDER KAJIAN TEORI (BAB II)
    # Target Order:
    # 1. LKPD Elektronik Berbasis Web dan Model Pengembangan ADDIE
    # 2. Generative Artificial Intelligence (GenAI) dan Large Language Model (LLM)
    # 3. Representasi Formula Matematika dan Transformasi ke Office Math Markup Language (OMML)
    # 4. Pembelajaran Berdiferensiasi dan Teaching at the Right Level (TaRL)
    # 5. Asesmen Diagnostik dan Kesiapan Belajar
    # 6. Scaffolding dan Higher Order Thinking Skills (HOTS)
    # 7. Materi Rasio dan Perbandingan
    # ---------------------------------------------------------
    kt_idx = -1
    kerangka_idx = -1
    for i, el in enumerate(body):
        t = ''.join(el.itertext())
        if 'Kajian Teori' in t and kt_idx == -1 and i > 70:
            kt_idx = i
        elif 'Kerangka Teoretis' in t and kerangka_idx == -1 and i > 100:
            kerangka_idx = i
            break

    print(f"Kajian Teori heading at body[{kt_idx}], Kerangka Teoretis at body[{kerangka_idx}]")

    # The concluding paragraph is right before Kerangka Teoretis
    # Let's find concluding paragraph ("Sintesis di atas menunjukkan empat celah ilmiah...")
    concluding_node = None
    spacer_before_concluding = None
    for i in range(kt_idx + 1, kerangka_idx):
        t = ''.join(body[i].itertext()).strip()
        if "Sintesis di atas menunjukkan empat celah ilmiah" in t:
            concluding_node = body[i]
            spacer_before_concluding = body[i-1]
            break

    kt_blocks = {}
    curr_kt_h = None
    curr_kt_nodes = []
    end_kt_range = body.index(spacer_before_concluding) if spacer_before_concluding is not None else kerangka_idx

    for i in range(kt_idx + 1, end_kt_range):
        el = body[i]
        t = ''.join(el.itertext()).strip()
        if any(t.startswith(prefix) for prefix in [
            "Materi Rasio", "Asesmen Diagnostik", "Pembelajaran Berdiferensiasi",
            "Scaffolding", "Generative Artificial Intelligence",
            "LKPD Elektronik", "Representasi Formula"
        ]):
            if curr_kt_h:
                kt_blocks[curr_kt_h] = curr_kt_nodes
            curr_kt_h = t
            curr_kt_nodes = [el]
        else:
            if curr_kt_h:
                curr_kt_nodes.append(el)
    if curr_kt_h:
        kt_blocks[curr_kt_h] = curr_kt_nodes

    print("Found Kajian Teori blocks:", list(kt_blocks.keys()))

    target_kt_order = [
        "LKPD Elektronik",
        "Generative Artificial Intelligence",
        "Representasi Formula",
        "Pembelajaran Berdiferensiasi",
        "Asesmen Diagnostik",
        "Scaffolding",
        "Materi Rasio"
    ]

    ordered_kt_nodes = []
    for key_pattern in target_kt_order:
        matched_k = None
        for k in kt_blocks:
            if k.startswith(key_pattern):
                matched_k = k
                break
        if matched_k:
            ordered_kt_nodes.extend(kt_blocks[matched_k])
        else:
            raise ValueError(f"Could not find Kajian Teori block matching: {key_pattern}")

    # Remove old KT blocks from body
    for k, nodes in kt_blocks.items():
        for n in nodes:
            body.remove(n)

    # Insert ordered KT blocks right after kt heading
    insert_kt_pos = body.index(body[kt_idx]) + 1
    for n in ordered_kt_nodes:
        body.insert(insert_kt_pos, n)
        insert_kt_pos += 1
    print("4. Successfully reordered Kajian Teori (BAB II) to match DO!")

    doc.save(docx_path)
    print("Saved reordered DO & Kajian Teori to docx.")

if __name__ == "__main__":
    backup_master()
    apply_image_replacement(MASTER_DOCX, IMAGE_SRC)
    reorder_do_and_kajian(MASTER_DOCX)
