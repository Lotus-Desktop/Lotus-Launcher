export enum Encoding {
    ASCII,
    Base64,
    Binary,
    Hex,
    Latin1,
    UCS2,
    UTF8,
    UTF16LE,
}

export enum permissions {
    READ,
    WRITE,
}

export default abstract  class DataResource {
    path: string;
    permissionList: [permissions.READ?, permissions.WRITE?];

    constructor(path: string, access: [permissions.READ?, permissions.WRITE?] = [permissions.READ]) {
        this.path = path;
        this.permissionList = access;
    }

    abstract async read(encoding?: Encoding): Promise<string>;
    abstract async write(content: string, encoding?: Encoding): Promise<void>;
    abstract async append(content: string, encoding?: Encoding): Promise<void>;

    getPath(): string {
        return this.path;
    }
}
