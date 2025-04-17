class CustomError extends Error {
  constructor(message, name, status, originalError = null) {
    super(message);
    this.name = name;
    this.status = status;
    this.timestamp = new Date().toISOString();
    this.originalError = originalError;
    this.logError();
  }

  logError() {
    console.error(`\n[${this.name}] (${this.status}) - ${this.timestamp}`);
    console.error(`Message: ${this.message}`);
    if (this.originalError) {
      console.error("Original error:", this.originalError);
    }
    // console.error("Stack trace:", this.stack.split("\n").slice(1).join("\n"));
    console.error("-----------------------------------\n");
  }
}

export class DatabaseError extends CustomError {
  constructor(message, error) {
    super(message, "DatabaseError", 500, error);
  }
}

export class ValidationError extends CustomError {
  constructor(message, error) {
    super(message, "ValidationError", 400, error);
  }
}

export class NotFoundError extends CustomError {
  constructor(message, error) {
    super(message, "NotFoundError", 404, error);
  }
}

export class ErrorConnectDB extends CustomError {
  constructor(messsage, error) {
    super(messsage, "ErrorConnectDB", 401, error);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message, error) {
    super(message, "UnathorizedError", 401, error);
  }
}

export class InternalServerError extends CustomError {
  constructor(message, error) {
    super(message, "InternalServerError", 500, error);
  }
}
