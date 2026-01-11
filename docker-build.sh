#!/bin/bash

# Script for building Docker images with versioning
# Usage: ./docker-build.sh [version] [tag]

set -e

# Get version from argument or generate from git
VERSION=${1:-$(git describe --tags --always 2>/dev/null || git rev-parse --short HEAD 2>/dev/null || echo "dev")}
TAG=${2:-"latest"}

# Configuration
IMAGE_NAME="filebump"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-registry.services.mobilon.ru}"
NODE_ENV="${NODE_ENV:-production}"
FULL_IMAGE_NAME="${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}"

echo "========================================="
echo "Building Docker image"
echo "========================================="
echo "Image name: ${FULL_IMAGE_NAME}"
echo "Tag: ${TAG}"
echo "Version: ${VERSION}"
echo "Node environment: ${NODE_ENV}"
echo "========================================="

# Build the image
docker build \
  --build-arg NODE_ENV=${NODE_ENV} \
  --tag ${FULL_IMAGE_NAME} \
  --tag ${DOCKER_REGISTRY}/${IMAGE_NAME}:${TAG} \
  .

echo ""
echo "========================================="
echo "Build completed successfully!"
echo "========================================="
echo "Image: ${FULL_IMAGE_NAME}"
echo "Tagged as: ${DOCKER_REGISTRY}/${IMAGE_NAME}:${TAG}"
echo ""
echo "To push the image:"
echo "  docker push ${FULL_IMAGE_NAME}"
echo "  docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${TAG}"
echo "========================================="
