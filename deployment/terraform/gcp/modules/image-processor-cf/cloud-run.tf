resource "google_cloud_run_v2_job" "image_processor" {
  name     = local.name
  location = var.region

  template {
    template {
      max_retries = local.max_retries
      timeout     = local.timeout

      containers {
        image = local.image

        resources {
          limits = {
            cpu    = local.cpu
            memory = local.memory_size
          }
        }

        # Image-processor
        env {
          name  = "MONGO_URI"
          value = var.MONGO_URI
        }
        env {
          name  = "DEFAULT_BATCH_SIZE"
          value = var.APP_CONFIG.DEFAULT_BATCH_SIZE
        }
        env {
          name  = "READER_TYPE"
          value = var.APP_CONFIG.READER_TYPE
        }
        env {
          name  = "FILE_PATH"
          value = var.APP_CONFIG.FILE_PATH
        }
        env {
          name  = "THUMBNAIL_WIDTH"
          value = var.APP_CONFIG.THUMBNAIL_WIDTH
        }
        env {
          name  = "THUMBNAIL_HEIGHT"
          value = var.APP_CONFIG.THUMBNAIL_HEIGHT
        }

        # Node variables
        env {
          name  = "LOG_LEVEL"
          value = var.env == "dev" ? "debug" : "info"
        }
        env {
          name  = "DEBUG_MODE"
          value = var.env == "prod" ? "false" : "true"
        }
        env {
          name  = "ENVIRONMENT_NAME"
          value = var.env
        }
      }
    }

    labels = merge(var.labels, {
      component = "lambda-job"
      app       = "image-processing"
    })
  }

  lifecycle {
    ignore_changes = [
      launch_stage,
    ]
  }
}

