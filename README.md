# Image processor (thumbnails from images)

This project is a simple proof-of-concept how to improve a already made image processor. (or just rewrite it)

## Installation

### Prerequisites

This project is built on node v20.12.2 and npm 10.5.0 with yarn globally installed.

### Node modules

Install required packages by running:

```bash
yarn install
```

### Environment

Create `.env` file in the root of the project,
Copy contents of `.env.example` to `.env` file.

### Docker container

Project uses a mongo database to hold relevant data.
To dockerize it locally so we don't use any cloud resources run (needs to have `.env` file):

```bash
docker-compose -f ./image-processor/docker-compose.yml -p image_processors up -d
```

### Configuring

You can use one of two approaches to running the app code:
With `Observables` or `For of` loop, just go to the `/src/main.ts` file and change `service.process('ForOf')` input.
Also each of the `.env` parameter is up to your customization.
Note that lower batches may lead to decreased performance.
