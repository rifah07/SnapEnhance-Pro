import cv2
import numpy as np
from PIL import Image
from rembg import remove
import os

def apply_grayscale(img):
    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

def apply_invert(img):
    return cv2.bitwise_not(img)

def apply_blur(img, kernel_size=15):
    return cv2.GaussianBlur(img, (kernel_size, kernel_size), 0)

def apply_edge_detect(img, threshold1=100, threshold2=200):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return cv2.Canny(gray, threshold1, threshold2)

def apply_pencil_sketch(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    inv = cv2.bitwise_not(gray)
    blur = cv2.GaussianBlur(inv, (21, 21), 0)
    return cv2.divide(gray, 255 - blur, scale=256)

def apply_cartoonify(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.medianBlur(gray, 5)
    edges = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 9)
    color = cv2.bilateralFilter(img, 9, 300, 300)
    return cv2.bitwise_and(color, color, mask=edges)

def apply_sharpen(img):
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    return cv2.filter2D(img, -1, kernel)

def apply_sepia(img):
    kernel = np.array([[0.272, 0.534, 0.131],
                      [0.349, 0.686, 0.168],
                      [0.393, 0.769, 0.189]])
    return cv2.transform(img, kernel)

def apply_watercolor(img):
    return cv2.stylization(img, sigma_s=60, sigma_r=0.6)

def apply_hdr(img):
    return cv2.detailEnhance(img, sigma_s=12, sigma_r=0.15)

def apply_night_vision(img):
    return cv2.applyColorMap(img, cv2.COLORMAP_JET)

def apply_thermal(img):
    return cv2.applyColorMap(img, cv2.COLORMAP_HOT)

def apply_emboss(img):
    kernel = np.array([[-2, -1, 0], [-1, 1, 1], [0, 1, 2]])
    return cv2.filter2D(img, -1, kernel)

def apply_mosaic(img, pixel_size=10):
    h, w = img.shape[:2]
    small = cv2.resize(img, (w // pixel_size, h // pixel_size), interpolation=cv2.INTER_LINEAR)
    return cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)

def apply_vignette(img, level=30):
    rows, cols = img.shape[:2]
    X_resultant_kernel = cv2.getGaussianKernel(cols, cols/level)
    Y_resultant_kernel = cv2.getGaussianKernel(rows, rows/level)
    kernel = Y_resultant_kernel * X_resultant_kernel.T
    mask = kernel / kernel.max()
    return np.uint8(img * mask[:, :, np.newaxis])

def apply_texture_overlay(img, texture_path="texture.jpg"):
    texture = cv2.imread(texture_path)
    if texture is None:
        return img
    texture = cv2.resize(texture, (img.shape[1], img.shape[0]))
    return cv2.addWeighted(img, 0.7, texture, 0.3, 0)

def apply_color_pop(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    color = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
    return cv2.addWeighted(img, 0.7, color, 0.3, 0)

def apply_halftone(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.resize(gray, (gray.shape[1]//2, gray.shape[0]//2))
    gray = cv2.resize(gray, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_NEAREST)
    return cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

def remove_background(img_pil):
    return remove(img_pil)

def process_image(input_path, effect):
    output_dir = "processed"
    os.makedirs(output_dir, exist_ok=True)
    
    filename = os.path.splitext(os.path.basename(input_path))[0]
    output_path = os.path.join(output_dir, f"{filename}_{effect}.png")
    
    img = cv2.imread(input_path)
    if img is None:
        raise ValueError("Failed to read image")
    
    effect_mapping = {
        "grayscale": apply_grayscale,
        "invert": apply_invert,
        "blur": lambda x: apply_blur(x, 15),
        "edge-detect": apply_edge_detect,
        "pencil-sketch": apply_pencil_sketch,
        "cartoonify": apply_cartoonify,
        "sharpen": apply_sharpen,
        "sepia": apply_sepia,
        "watercolor": apply_watercolor,
        "hdr": apply_hdr,
        "night-vision": apply_night_vision,
        "thermal": apply_thermal,
        "emboss": apply_emboss,
        "mosaic": lambda x: apply_mosaic(x, 10),
        "vignette": apply_vignette,
        "color-pop": apply_color_pop,
        "halftone": apply_halftone
    }
    
    if effect == "background-remove":
        img_pil = Image.open(input_path).convert("RGBA")
        result = remove_background(img_pil)
        result.save(output_path)
    elif effect in effect_mapping:
        result = effect_mapping[effect](img)
        cv2.imwrite(output_path, result)
    else:
        raise ValueError(f"Unsupported effect: {effect}")
    
    return output_path