variable "env" {
  type        = string
  description = "Environment name"

  validation {
    condition     = contains(["stage", "prod", "dev"], var.env)
    error_message = "Invalid environment name!"
  }
}

variable "labels" {
  type = object({
    env       = string
    version   = number
  })

  description = "set of labels for searching and identification of resources"
}

variable "region" {
  type = string

  validation {
    condition     = length(var.region) > 0
    error_message = "Invalid project name!"
  }
}

variable "project" {
  type = string

  validation {
    condition     = length(var.project) > 0
    error_message = "Invalid project name!"
  }
}

variable "MONGO_URI" {
  type = string

  validation {
    condition = can(regex(
      "^mongodb(?:\\+srv)?:\\/\\/([a-zA-Z0-9._%+-]+):([a-zA-Z0-9._%+-]+)@[a-zA-Z0-9.-]+(:\\d+)?(\\/[a-zA-Z0-9._%+-]+)?(\\?.*)?$",
      var.MONGO_URI
    ))
    error_message = "Invalid mongo connection uri: mongodb://<username>:<password>@<host>/<database>?<options> !"
  }
}

variable "APP_CONFIG" {
  type = object({
    DEFAULT_BATCH_SIZE = number
    READER_TYPE       = string
    FILE_PATH         = string
    THUMBNAIL_WIDTH   = number
    THUMBNAIL_HEIGHT  = number
  })

  validation {
    condition = alltrue([
      var.APP_CONFIG.READER_TYPE == "CSV",
      var.APP_CONFIG.DEFAULT_BATCH_SIZE > 15,
      can(regex("^[a-zA-Z0-9_/.-]+$", var.APP_CONFIG.FILE_PATH)),
      var.APP_CONFIG.THUMBNAIL_WIDTH >= 64,
      var.APP_CONFIG.THUMBNAIL_HEIGHT >= 64
    ])

    error_message = <<EOT
Validation failed for APP_CONFIG:
- READER_TYPE must be one of ['CSV'].
- DEFAULT_BATCH_SIZE must be greater than 15.
- FILE_PATH must be a valid file path containing only alphanumeric characters, dashes, underscores, periods, or slashes.
- THUMBNAIL_WIDTH and THUMBNAIL_HEIGHT must be equal or greater than 64.
EOT
  }
}
