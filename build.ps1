& docker build -t smpp smpp
& docker rm -f smpp
& docker run --restart always -d -p 3000:3000 --name smpp --expose=3000 smpp:latest
