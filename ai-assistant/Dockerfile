FROM python:3.11-slim

WORKDIR /app

# ── Step 1: Install torch CPU-only FIRST (before sentence-transformers)
#    This prevents pip from resolving the CUDA variant later.
RUN pip install --no-cache-dir \
    torch==2.2.2+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# ── Step 2: Install the rest (sentence-transformers will reuse the CPU torch)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── App code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
