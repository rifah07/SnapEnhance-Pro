import os
from pathlib import Path

# Ensure processed/ directory exists
PROCESSED_DIR = Path(__file__).parent / "processed"
os.makedirs(PROCESSED_DIR, exist_ok=True)

from .effects import (
    process_image,
    apply_grayscale,
    apply_sharpen
)

__all__ = ['process_image', 'apply_grayscale', 'apply_sharpen']