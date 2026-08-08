import io
import os
import zipfile
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
import pikepdf
from pikepdf import PdfImage
from PIL import Image
from pypdf import PdfReader, PdfWriter
import pypdfium2 as pdfium

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[f"http://localhost:{os.getenv('WEB_PORT')}", "https://pdfify-iby9.onrender.com/"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/merge")
async def merge_pdf(files: list[UploadFile] = File(...)):
    doc = PdfWriter()

    for file in files:
        content = await file.read()
        doc.append(io.BytesIO(content))

    out = io.BytesIO()
    doc.write(out)
    out.seek(0)

    return StreamingResponse(
        out,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=merged.pdf"}
    )

@app.post("/split")
async def split(file: UploadFile = File(...)):
    content = await file.read()
    pdf = pdfium.PdfDocument(content)

    zip_stream = io.BytesIO()

    with zipfile.ZipFile(zip_stream, "w") as zip_file:
        for i, page in enumerate(pdf, start=1):  # start at 1 so page_0.pdf isn't created
            bitmap = page.render(scale=150 / 72)
            img = bitmap.to_pil()
            img_buffer = io.BytesIO()
            img.save(img_buffer, format="PNG")
            zip_file.writestr(f"page_{i}.png", img_buffer.getvalue())

    zip_stream.seek(0)
    return StreamingResponse(
        zip_stream, 
        media_type="application/zip", 
        headers={
            "Content-Disposition": "attachment; filename=split_pages.zip"
        }
    )

@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    content = await file.read()
    reader = PdfReader(io.BytesIO(content))

    pages_text = [
        f"--- Page {i} ---\n{page.extract_text() or ''}" 
        for i, page in enumerate(reader.pages, start=1)
    ]
    full_text = "\n\n".join(pages_text)

    return StreamingResponse(
        io.BytesIO(full_text.encode("utf-8")),
        media_type="text/plain",
        headers={"Content-Disposition": "attachment; filename=extracted.txt"},
    )

def downsample_image(pil_image, target_dpi=150, original_dpi=300):
    if target_dpi >= original_dpi:
        return pil_image
    scale = target_dpi / original_dpi
    new_size = max(1, int(pil_image.width * scale)), max(1, int(pil_image.height * scale))  # prevent crashing on downscaling small images 
    return pil_image.resize(new_size, Image.LANCZOS)

@app.post("/compress")
async def compress_pdf(file: UploadFile = File(...)):
    quality = 60
    target_dpi = 150

    content = await file.read()
    pdf = pikepdf.open(io.BytesIO(content))

    del pdf.docinfo
    pdf.remove_unreferenced_resources()

    for page in pdf.pages:
        for name, raw_image in page.images.items():
            try:
                pil_image = PdfImage(raw_image).as_pil_image()
            except Exception:
                continue

            pil_image = downsample_image(pil_image, target_dpi=target_dpi)

            if pil_image.mode not in ("RGB", "L"):
                pil_image = pil_image.convert("RGB")

            buffer = io.BytesIO()
            pil_image.save(buffer, format="JPEG", quality=quality, optimize=True)
            buffer.seek(0)
            raw_image.write(buffer.read(), filter=pikepdf.Name("/DCTDecode"))

    out = io.BytesIO()
    pdf.save(out, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)
    pdf.close()
    out.seek(0)

    return StreamingResponse(
        out, 
        media_type="application/pdf", 
        headers={"Content-Disposition": "attachment; filename=compressed.pdf"}
    )