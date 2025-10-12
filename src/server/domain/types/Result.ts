export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
    readonly value: T;
    readonly isSuccess = true;
    readonly isFailure = false;

    constructor(value: T) {
        this.value = value;
    }

    static of<T>(value: T): Success<T> {
        return new Success(value);
    }
}

export class Failure<E> {
    readonly error: E;
    readonly isSuccess = false;
    readonly isFailure = true;

    constructor(error: E) {
        this.error = error;
    }

    static of<E>(error: E): Failure<E> {
        return new Failure(error);
    }
}

export const success = <T>(value: T): Result<T> => Success.of(value);
export const failure = <E>(error: E): Result<never, E> => Failure.of(error);