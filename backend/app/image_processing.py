import cv2
import numpy as np
from typing import Dict, Callable

def apply_grayscale(img: np.ndarray) -> np.ndarray:
    """Convert image to grayscale"""
    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

def apply_invert(img: np.ndarray) -> np.ndarray:
    """Invert image colors"""
    return cv2.bitwise_not(img)

def apply_blur(img: np.ndarray, kernel_size: int = 15) -> np.ndarray:
    """Apply Gaussian blur"""
    return cv2.GaussianBlur(img, (kernel_size, kernel_size), 0)

def apply_edge_detect(img: np.ndarray, threshold1: int = 100, threshold2: int = 200) -> np.ndarray:
    """Detect edges using Canny algorithm"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return cv2.Canny(gray, threshold1, threshold2)

def apply_pencil_sketch(img: np.ndarray) -> np.ndarray:
    """Convert image to pencil sketch"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    inv = cv2.bitwise_not(gray)
    blur = cv2.GaussianBlur(inv, (21, 21), 0)
    return cv2.divide(gray, 255 - blur, scale=256)

def apply_cartoonify(img: np.ndarray) -> np.ndarray:
    """Apply cartoon effect"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.medianBlur(gray, 5)
    edges = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 9)
    color = cv2.bilateralFilter(img, 9, 300, 300)
    return cv2.bitwise_and(color, color, mask=edges)

def apply_sharpen(img: np.ndarray) -> np.ndarray:
    """Sharpen image"""
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    return cv2.filter2D(img, -1, kernel)

def apply_sepia(img: np.ndarray) -> np.ndarray:
    """Apply sepia filter"""
    kernel = np.array([
        [0.272, 0.534, 0.131],
        [0.349, 0.686, 0.168],
        [0.393, 0.769, 0.189]
    ])
    return cv2.transform(img, kernel)

def apply_watercolor(img: np.ndarray) -> np.ndarray:
    """Apply watercolor effect"""
    return cv2.stylization(img, sigma_s=60, sigma_r=0.6)

def apply_hdr(img: np.ndarray) -> np.ndarray:
    """Enhance details for HDR effect"""
    return cv2.detailEnhance(img, sigma_s=12, sigma_r=0.15)

def apply_thermal(img: np.ndarray) -> np.ndarray:
    """Apply thermal camera effect"""
    return cv2.applyColorMap(img, cv2.COLORMAP_HOT)

def apply_night_vision(img: np.ndarray) -> np.ndarray:
    """Apply night vision effect"""
    return cv2.applyColorMap(img, cv2.COLORMAP_JET)

def apply_emboss(img: np.ndarray) -> np.ndarray:
    """Apply emboss effect"""
    kernel = np.array([[-2, -1, 0], [-1, 1, 1], [0, 1, 2]])
    return cv2.filter2D(img, -1, kernel)

def apply_mosaic(img: np.ndarray, pixel_size: int = 10) -> np.ndarray:
    """Pixelate image (mosaic effect)"""
    h, w = img.shape[:2]
    small = cv2.resize(img, (w//pixel_size, h//pixel_size))
    return cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)

def apply_vignette(img: np.ndarray, level: int = 30) -> np.ndarray:
    """Apply vignette effect"""
    rows, cols = img.shape[:2]
    X = cv2.getGaussianKernel(cols, cols/level)
    Y = cv2.getGaussianKernel(rows, rows/level)
    mask = Y * X.T
    return np.uint8(img * mask[:,:,np.newaxis])

def apply_halftone(img: np.ndarray) -> np.ndarray:
    """Apply halftone effect"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.resize(gray, (gray.shape[1]//2, gray.shape[0]//2))
    return cv2.resize(gray, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_NEAREST)

def apply_pop_art(img: np.ndarray) -> np.ndarray:
    """Apply pop art effect"""
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    L, A, B = cv2.split(lab)
    _, A = cv2.threshold(A, 127, 255, cv2.THRESH_BINARY)
    _, B = cv2.threshold(B, 127, 255, cv2.THRESH_BINARY)
    return cv2.merge([L, A, B])

EFFECTS_MAP: Dict[str, Callable[[np.ndarray], np.ndarray]] = {
    "grayscale": apply_grayscale,
    "invert": apply_invert,
    "blur": apply_blur,
    "edge-detect": apply_edge_detect,
    "pencil-sketch": apply_pencil_sketch,
    "cartoonify": apply_cartoonify,
    "sharpen": apply_sharpen,
    "sepia": apply_sepia,
    "watercolor": apply_watercolor,
    "hdr": apply_hdr,
    "thermal": apply_thermal,
    "night-vision": apply_night_vision,
    "emboss": apply_emboss,
    "mosaic": apply_mosaic,
    "vignette": apply_vignette,
    "halftone": apply_halftone,
    "pop-art": apply_pop_art
}

def process_image(img: np.ndarray, effect: str) -> np.ndarray:
    """Apply specified effect to image"""
    if effect not in EFFECTS_MAP:
        raise ValueError(f"Unsupported effect: {effect}")
    
    processor = EFFECTS_MAP[effect]
    return processor(img)