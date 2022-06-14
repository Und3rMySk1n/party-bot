export class NoRunningGameError extends Error {
    constructor(message) {
        super(message);
        this.name = "NoRunningGameError";
    }
}

export class NoPlayerError extends Error {
    constructor(message) {
        super(message);
        this.name = "NoPlayerError";
    }
}