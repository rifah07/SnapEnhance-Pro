To install dependencides-

Go do backend directory (cd backend):
Now run these in your terminal:
1. pip install --force-reinstall gunicorn==20.1.0
2. pip install -r requirements.txt- to install all dependencies in backend
3. python3 -c "import flask, cv2, rembg, gunicorn, dotenv; print('All packages installed successfully!')"- to check all dependencies in backend
4. uvicorn backend.app.main:app --reload- to run locally
5. Backend in deployed in Render (Docker image)

Frontend:
1. Frontend is made with HTML, CSS, Javascript and Dockerized too.
2. Frontend is deployed in Vercel.
3. Anyone can register, login and process image.  
