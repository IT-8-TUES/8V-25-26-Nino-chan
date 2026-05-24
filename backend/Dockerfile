FROM python:3.12-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends nodejs npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend-requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

RUN npm install mongodb bcryptjs dotenv

COPY endpoints/ /endpoints/
COPY backend/ .
COPY seed.js .

COPY docker/entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 5000 5001

ENTRYPOINT ["/entrypoint.sh"]
