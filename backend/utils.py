import fitz
import os
from PIL import Image
import tempfile

def convert_pdf_to_images(pdf_path):
    images = []
    dimensions = {}
    doc = fitz.open(pdf_path)
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        zoom = 2.0
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat)
        
        # Save to temp file
        temp_img_path = os.path.join(tempfile.gettempdir(), f"page_{page_num}.png")
        pix.save(temp_img_path)
        
        images.append(temp_img_path)
        dimensions[page_num + 1] = (pix.width, pix.height)
        
    return images, dimensions
