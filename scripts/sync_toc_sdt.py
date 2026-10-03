import docx

p = r'C:\Users\LATITUDE 3310 TOUCH\Documents\DOCUMENT RYAN\02_Kuliah\Semester_7\KF21518001 - Skripsi (Kelas A)\03_Draft Proposal (BAB 1-3)\Proposal_Skripsi_Ryan_Wardiana_Revisi_Bimbingan_2_Draft.docx'
doc = docx.Document(p)
body = doc._element.body

sdt = next(el for el in body if el.tag.endswith('sdt'))
paras = list(sdt.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'))

updates = {
    9: ("3.1", "Web Application LKPD Berbasis GenAI", "4"),
    10: ("3.2", "Generative Artificial Intelligence (GenAI) dan Large Language Model (LLM)", "4"),
    11: ("3.3", "Representasi Formula Matematika dan Transformasi ke Office Math Markup Language (OMML)", "4"),
    12: ("3.4", "Pembelajaran Berdiferensiasi dan Teaching at the Right Level (TaRL)", "5"),
    13: ("3.5", "Asesmen Diagnostik dan Kesiapan Belajar", "5"),
    14: ("3.6", "Scaffolding dan Higher Order Thinking Skills (HOTS)", "5"),
    15: ("3.7", "Materi Rasio dan Perbandingan", "6"),
    22: ("6.1.1", "LKPD Elektronik Berbasis Web dan Model Pengembangan ADDIE", "8"),
    23: ("6.1.2", "Generative Artificial Intelligence (GenAI) dan Large Language Model (LLM)", "10"),
    24: ("6.1.3", "Representasi Formula Matematika dan Transformasi ke Office Math Markup Language (OMML)", "11"),
    25: ("6.1.4", "Pembelajaran Berdiferensiasi dan Teaching at the Right Level (TaRL)", "13"),
    26: ("6.1.5", "Asesmen Diagnostik dan Kesiapan Belajar", "14"),
    27: ("6.1.6", "Scaffolding dan Higher Order Thinking Skills (HOTS)", "16"),
    28: ("6.1.7", "Materi Rasio dan Perbandingan", "18"),
    42: ("7.6", "Waktu dan Tempat Penelitian", "34")
}

for idx, (num, title, page) in updates.items():
    par = paras[idx]
    t_nodes = list(par.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'))
    if len(t_nodes) >= 3:
        t_nodes[0].text = num
        t_nodes[1].text = title
        t_nodes[2].text = page
        print(f"Updated SDT [{idx}]: {num} | {title} | {page}")

doc.save(p)
print("Saved docx successfully!")
