FROM python:3.11-slim

WORKDIR /app

# System deps kept minimal for DEMO mode. Uncomment build-essential if you
# enable REAL MODEL mode and need to compile sentencepiece/torch extras.
# RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY .env.example .env

ENV DEMO_MODE=true
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
