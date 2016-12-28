#!/bin/bash

IMAGE_NAME="webiverse-http"
PORT="8233"

function cmd {
    COMMAND=`echo $@ | sed 's/^"\(.*\)"$/\1/' || echo $@`
    echo "Executing: ${COMMAND}"
    ${COMMAND}
}

INTERACTIVE=false
STOP_ONLY=false
FOREGROUND=false

for i in "$@"
do
  case ${i} in
    -i)
      echo "== Interactive mode =="
      INTERACTIVE=true
    ;;
    -s)
      echo "== Stop only =="
      STOP_ONLY=true
    ;;
    -f)
      echo "== Foreground mode =="
      FOREGROUND=true
    ;;
  esac
done

if ! type "docker" &>/dev/null; then
    echo "Docker must be installed."
    exit 1
fi

DIRECTORY=$(dirname $(dirname "`readlink -f "$0"`"))
echo "Using directory: ${DIRECTORY}"

CURRENT=`sudo docker ps | grep " ${IMAGE_NAME}:" | awk '{print $1}'`

if [ ! -z "${CURRENT}" ]; then
    echo "Stopping ${CURRENT}..."
    cmd sudo docker kill ${CURRENT} || echo $?
fi

if ${STOP_ONLY}; then
  exit 0
fi

echo "Building ${IMAGE_NAME}..."
cmd sudo docker build -t ${IMAGE_NAME} ${DIRECTORY}/http/

echo "Running ${IMAGE_NAME}..."
if ${INTERACTIVE}; then
    cmd sudo docker run -v ${DIRECTORY}:/var/www -p ${PORT}:80 -i -t ${IMAGE_NAME} /bin/bash
elif ${FOREGROUND}; then
    cmd exec sudo docker run -v ${DIRECTORY}:/var/www -p ${PORT}:80 -i ${IMAGE_NAME} /start
else
    cmd sudo docker run -v ${DIRECTORY}:/var/www -p ${PORT}:80 -d ${IMAGE_NAME}
    echo -e "\nServer built successfully at: http://localhost:${PORT}"
fi
