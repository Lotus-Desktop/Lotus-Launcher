import * as os from "os";
import * as fs from "fs";
import DataResource, {Encoding, permissions} from "./DataResource";
import PathResolver, {Type} from "./PathResolver";

export default class File extends DataResource {
    static pathUtil: PathResolver;

    constructor(path: string, make: boolean = true, access: [permissions.READ?, permissions.WRITE?] = [permissions.READ]) {
        super(path, access);

        if (!File.pathUtil)
            File.pathUtil = new PathResolver({root: os.homedir(), pathType: Type.Unix});

        if (make)
            this.conditionalMake();
    }

    conditionalMake() {
        if (!fs.existsSync(File.pathUtil.up(this.path))) {
            fs.mkdirSync(File.pathUtil.up(this.path));
            fs.writeFileSync(this.path, "");
        }
    }

    async read(encoding: Encoding = Encoding.UTF8): Promise<string> {
        return fs.readFileSync(this.path, {encoding: Encoding[encoding].toString().toLowerCase() as BufferEncoding});
    }

    async write(content: string, encoding: Encoding = Encoding.UTF8): Promise<void> {
        fs.writeFileSync(this.path, content, {encoding: Encoding[encoding].toString().toLowerCase() as BufferEncoding})
    }

    async append(content: string, encoding: Encoding = Encoding.UTF8): Promise<void> {
        fs.appendFileSync(this.path, content, {encoding: Encoding[encoding].toString().toLowerCase() as BufferEncoding})
    }
}
