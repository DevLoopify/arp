FROM golang:1.26-alpine AS build
WORKDIR /src

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
RUN CGO_ENABLED=0 go build -o /out/api ./cmd/api

FROM alpine:3.20
WORKDIR /app

COPY --from=build /out/api ./api

ENV PORT=8080
ENV UPLOAD_DIR=/app/uploads

EXPOSE 8080
CMD ["./api"]
