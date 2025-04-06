To install dependencides-

Go do backend directory (cd backend):
Now run these in your terminal:
1. pip install --force-reinstall gunicorn==20.1.0
2. pip install -r requirements.txt
3. python3 -c "import flask, cv2, rembg, gunicorn, dotenv; print('All packages installed successfully!')".
4. To run backend app: FLASK_APP=$(pwd)/backend/app/__init__.py flask run or "export FLASK_APP=backend.app
flask run"
5. uvicorn backend.app.main:app --reload- to run locally