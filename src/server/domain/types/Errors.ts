export class DomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DomainError';
    }
}

export class ValidationError extends DomainError {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends DomainError {
    constructor(resource: string, id: string) {
        super(`${resource} with id ${id} not found`);
        this.name = 'NotFoundError';
    }
}

export class ConflictError extends DomainError {
    constructor(message: string) {
        super(message);
        this.name = 'ConflictError';
    }
}

export class UnauthorizedError extends DomainError {
    constructor(message: string = 'Unauthorized') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}