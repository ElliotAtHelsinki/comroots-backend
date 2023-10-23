#!/bin/bash

docker build --no-cache -t elliotathelsinki/comroots:latest .
docker push elliotathelsinki/comroots:latest
ssh -i /home/elliot/.ssh/id_rsa root@167.99.32.88 "sudo docker pull elliotathelsinki/comroots:latest && sudo dokku git:from-image comroots elliotathelsinki/comroots:latest && sudo dokku ps:rebuild comroots"