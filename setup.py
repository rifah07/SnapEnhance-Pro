from setuptools import setup, find_packages

setup(
    name="snapenhance",
    version="0.1",
    packages=find_packages(),  # Automatically finds all packages
    install_requires=[
        'flask>=2.0.0',
        'opencv-python-headless',
        'rembg',
        'numpy',
        'pillow'
    ],
    python_requires='>=3.8',
)