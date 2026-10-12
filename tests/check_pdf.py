import fitz

file_path = "uploads/gnaneswari_cv_.pdf"

document = fitz.open(file_path)

print("Number of pages:", len(document))

for page_number, page in enumerate(document):
    text = page.get_text()
    print(f"\n--- Page {page_number + 1} ---")
    print("Characters extracted:", len(text))
    print("Images found:", len(page.get_images(full=True)))
    print("Text:", text)

document.close()