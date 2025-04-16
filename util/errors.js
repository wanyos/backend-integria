
export class DatabaseError extends Error { 
    constructor(message) { 
        super(message)
        this.name = 'DatabaseError'
        this.status = 500
    }
}

export class ValidationError extends Error { 
    constructor(message) { 
        super(message)
        this.name = 'ValidationError'
        this.status = 400
    }
}

export class NotFoundError extends Error { 
    constructor(message) { 
        super(message)
        this.name = 'NotFoundError'
        this.status = 404
    }
}

export class ErrorConnectDB extends Error { 
    constructor(messsage) { 
        super(messsage)
        this.name = 'ErrorConnectDB'
        this.status = 401
    }
}

export class UnauthorizedError extends Error { 
    constructor(message) { 
        super(message)
        this.name = 'UnathorizedError'
        this.status = 401
    }
}

export class InternalServerError extends Error {
    constructor(message) {
      super(message)
      this.name = 'InternalServerError'
      this.status = 500
    }
  }
