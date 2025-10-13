#build stage
FROM golang:alpine AS builder
RUN apk add --no-cache git
WORKDIR /app
# RUN go get -d -v ./...
# RUN go build -o /go/bin/app -v ./...
COPY go.mod go.sum ./
RUN go mod download
COPY .env.local ./
COPY . .
RUN go build -o server ./cmd/api   # build main package

#final stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root
COPY --from=builder /app/server .
COPY --from=builder /app/.env.local .

ENTRYPOINT ["./server"]
LABEL Name=toothtoday Version=0.0.1
EXPOSE 8080
