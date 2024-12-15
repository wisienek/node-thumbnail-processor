# Image processor (thumbnails from images)

This project is a simple proof-of-concept how to improve an already made image processor. (or just rewrite it)
It improves the original processor in few main ways:

1. Code cleanness
   1. Moved to typescript with strict type enforcing
   2. Installed and used some libraries to help keep the code clean and neat
   3. Eslint configured for both `.json` and `.mjs` file types for backwards compatibility
2. Extendability
   1. Every processor can be extended with few different readers - providing current reader can be decided within the `app.module` by changing `ReaderService` provider. This can be further expanded by writing custom entries from Cloud buckets (most recommended).
   2. Configuration is easily added by just updating a ZOD dock and `.env` file
3. Validation
   1. Each file is first validated for input so we don't write to database anything that is not approved of.
4. Standardization
   1. Used a NestJS framework as a base for the application, so it can use other modules shared from apps / other functions.
   2. By dockerizing the app it can be deployed for multiple cloud providers with ease, just with some few changes inside base cloud config files.

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

### Running

To run the application just go with:

```bash
yarn start
```

Or to start with development mode:

```bash
yarn start:dev
```

## Deployment

### CLoud setup
To deploy the app from local environment (which it's mostly made for) you need to first log in to your Google cloud platform (made as an example)
Set up your cloud console as it's recommended and replace every `project  = "dauntless-drive-374111"` local with Your own project id, also can be done with region, but not needed.
Then create a `terraform` user with `Owner` privilege (easiest to replicate) and assign a JSON key for it which will then paste to each key folder inside a deployment structure.
List of folders to paste:
1. `deployment/terraform/gcp/state`
2. `deployment/terraform/gcp/env/shared`
3. `deployment/terraform/gcp/env/dev`

Then in the same order run apply command (not counting `dev`):
```bash 
terraform apply
```
This will create a basic cloud infrastructure that will be needed to deploy the app.

### Dockerization
Now log in into the docker registry with your JSON key:
```bash
docker login -u _json_key --password-stdin https://europe-central2-docker.pkg.dev < ./deployment/terraform/gcp/state/credentials.json
```

Then for building the docker image run this command. Of course remember to replace variables to match Your own project: `<region>-docker.pkg.dev/<project-id>/...`
```bash
docker buildx build \
      --platform linux/amd64 \
      --tag "europe-central2-docker.pkg.dev/dauntless-drive-374111/cf/image-processor:dev" \
      --push \
      --file="./Dockerfile" \
      .
```

### Final deployment
If you have your own copy of mongodb instance somewhere in cloud add `terraform.auto.tfvars` file with contents:
```md
MONGO_URI="mongodb://<username>:<password>@<host>/<database>?<options>"
```
Now our instance should be ready for deployment so go to the `dev` cloud environment and run:
```bash
terraform apply
```

Now it's all ready!

#### Running application
You can manually run it via `console.cloud.google.com/run/jobs/details/europe-central2/image-processor-dev/executions` and click `Execute` button.
Or create additional scheduler for it to run on some time frame, this would need additional `schedule.tf` file that would look like this:
```hcl
resource "google_cloud_scheduler_job" "scheduler" {
  region           = var.region
  name             = "image-processor-scheduler"
  description      = "HTTP Trigger job for ${title(google_cloud_run_v2_job.image_processor.name)}"
  schedule         = "0 9 1 * *"
  time_zone        = "Europe/Warsaw"
  attempt_deadline = "320s"

  retry_config {
    retry_count = 1
  }

  http_target {
    http_method = "POST"
    uri         = "https://${var.region}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${var.project}/jobs/${google_cloud_run_v2_job.image_processor.name}:run"

    oauth_token {
      service_account_email = google_service_account.schedule_user.email
    }
  }
}
```
and a `google_service_account.schedule_user` resource with scheduler permissions
