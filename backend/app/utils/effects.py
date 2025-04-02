import cv2
import numpy as np
from rembg import remove
from PIL import Image
import os

def process_image(input_path, effect):
    output_dir = "processed"
    os.makedirs(output_dir, exist_ok=True)
    
    filename = os.path.splitext(os.path.basename(input_path))[0]
    output_path = os.path.join(output_dir, f"{filename}_{effect}.png")
    
    img = cv2.imread(input_path)
    
    if effect == "grayscale":
        result = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        cv2.imwrite(output_path, result)
    elif effect == "pencil-sketch":
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        inv = cv2.bitwise_not(gray)
        blur = cv2.GaussianBlur(inv, (21, 21), 0)
        result = cv2.divide(gray, 255 - blur, scale=256)
        cv2.imwrite(output_path, result)
    elif effect == "background-remove":
        img_pil = Image.open(input_path)
        result = remove(img_pil)
        result.save(output_path)
    else:
        raise ValueError(f"Unknown effect: {effect}")
    
    return output_path