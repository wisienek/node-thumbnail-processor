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
