sudo setenforce 0 && docker build --progress=plain --rm -t foo . && docker run -it -v "$PWD"/src:/home/node/app -p 8081:8081 foo