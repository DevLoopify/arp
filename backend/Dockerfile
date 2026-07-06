FROM golang:1.26-alpine AS build
WORKDIR /src

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
RUN CGO_ENABLED=0 go build -o /out/api ./cmd/api
RUN CGO_ENABLED=0 go build -o /out/seed ./cmd/seed

FROM alpine:3.20
WORKDIR /app

COPY --from=build /out/api ./api
COPY --from=build /out/seed ./seed
COPY data/worplaces.json ./data/worplaces.json

ENV PORT=8080
ENV UPLOAD_DIR=/app/uploads
ENV SEED_FILE=/app/data/worplaces.json

EXPOSE 8080
CMD ["./api"]
