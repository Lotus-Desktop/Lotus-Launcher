import * as fs from "fs";
import * as os from "os";
import * as vm from "vm";

import * as JSON5 from 'json5';

import PathResolver, {Type} from "./PathResolver";
import {Library} from "./ManifestShape";
import {manifestLocation} from "./launcher";

export class ImportError extends Error {
    constructor(...args) {
        super(...args);
        this.name = "ImportError";
    }
}

export class LibraryLoader {
    env: { appId: string } = {
        appId: process.env.appId
    };
    public libraryRoot: string;
    private pathUtil: PathResolver;
    private libs: {
        [name: string]: string
    } = {};

    private importCache: Map<string, any>;

    private printImportDetails: boolean;

    constructor(printImportDetails: boolean) {
        this.pathUtil = new PathResolver({
            root: __dirname,
            pathType: Type.Unix
        });
        this.libraryRoot = this.pathUtil.join('/usr/lib/lotus');
        this.printImportDetails = printImportDetails;
        this.importCache = new Map<string, any>();
    }

    getGlobal<T extends {}>(filename: string, globals?: T) {
        return {
            require: (name: string, currentFile: string, native?: <T>(mod: string) => T) => this.resolve(currentFile || filename, name, native),
            Context: {
                argv: process.argv.slice(3),
                env: process.env,
                procId: process.pid,
                fileName: filename,
                root: manifestLocation,
                user: os.userInfo().username,
                stdin: process.stdin,
                stdout: process.stdout,
                stderr: process.stderr,
                exit(code: number) {
                    process.exit(code);
                }
            },
            console,
            Timing: {
                setTimeout,
                setInterval,
                setImmediate,
                clearTimeout,
                clearInterval,
                clearImmediate
            },
            ...(globals || {
                requireType: "unknown"
            })
        }
    };

    /**
     * acts as backend for `require` function
     *
     > library path syntax: organisation/group/libname/sublibname/module
     * The number of group specifiers (/) is arbitrary, however, must contain the library's name (the last item)
     * Lotus module !== TypeScript module. TS module = library (`declare module ... { ... }` is a library, whereas objects exported within it is a module).
     * Lotus libraries do not have to modularise their contents. Instead they may choose to use their root level to export all their functionality.
     - If this is the case, they become known as utilities, although they are by definition interchangeable, a differentiation between them is useful for documentation purposes.
     - A rule of thumb is that utilities are small, lightweight groups of helper functionality, such as a Path Manipulation, whereas a library is designed to
     provide APIs for applications such as HTTP or Graphics frameworks.
     *
     * @param current Path of the current file being executed
     * @param path Path of the file to run
     * @param native the native require function for passing to submodules
     */
    public resolve(current: string, path: string, native?: <T>(mod: string) => T): any {
        try {
            return this.pathUtil.isPath(path) ? this.loadFile(current, path, native) : this.loadLibrary(path);
        } catch (err) {
            console.error(err);
            process.exit(1);
            // throw err;
        }
    }

    /**
     * executes `path` in new context, isolating it from NodeJS's APIs
     * @param current Path of the current file being executed
     * @param path Path of the file to run
     * @param globals an extra set of global variables passed to the context
     */
    public run<T extends {}>(current: string, path: string, globals?: T) {
        const regexSafe = path.replace(/'/g, '\\')
        if (fs.existsSync(path) && fs.statSync(path).isFile()) {

            if (this.importCache.has(path))
                return this.importCache.get(path);

            const context = vm.createContext(this.getGlobal(current, globals));

            //language=JavaScript
            const code = `try {
    const fileName = '${regexSafe}';
    var require_native = require_native || null;
    (function (require, exports, fileName) {
        ${fs.readFileSync(path, 'utf8')}
        return exports;
    }).bind({})(module => require(module, fileName, require_native), {}, fileName);
} catch (err) {
    console.error(err);
    Context.exit(1);
}`;

            const mod = vm.runInNewContext(code, context, {columnOffset: 0, lineOffset: -4, filename: path});

            this.importCache.set(path, mod);

            return mod;
        }

        throw new ImportError(`Unable to load file ${path}. ${!fs.existsSync(path) ? 'File doesn\'t exist' : 'Path specified is not a file'}`);
    }

    private loadFile(current: string, path: string, native: <T>(mod: string) => T): any {
        const file = this.pathUtil.join(this.pathUtil.up(current), path);
        const fileName = this.pathUtil.split(file).pop();

        const acceptedFileTypes = [".js", ".mjs"];

        if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
            const newFile = this.pathUtil.join([file, 'index.js']);

            if (fs.existsSync(newFile))
                return this.run(current, newFile, {
                    requireType: "File",
                    require_native: native
                });
            else
                throw new ImportError(`Cannot import directory and './index.js' does not exist`);
        }

        if (this.printImportDetails)
            console.log("Currently at:", current, "requesting:", path, "found at:", file);

        const options = fs.readdirSync(this.pathUtil.up(file));
        const fileNames = options.map(i => ({
            isValid: i.indexOf(fileName) === 0,
            fileName: i
        }));
        const avail = fileNames.filter(i => i.isValid && acceptedFileTypes.map(j => i.fileName.toLowerCase().endsWith(j)).includes(true));

        if (avail[0])
            return this.run(current, this.pathUtil.join([this.pathUtil.up(file), avail[0].fileName]), {
                requireType: "file",
                require_native: native
            });

        throw new ImportError(`Unable to locate file ${file}`);
    }

    private loadLibrary(lib: string): any {
        const {root, library} = this.libNameParser(lib);

        const require_native = function <ModuleShape>(this: LibraryLoader, module: string): ModuleShape {
            const modPath = this.pathUtil.join(this.libraryRoot, "native", this.pathUtil.clean(module));
            return require(modPath) as ModuleShape;
        }

        return this.run(root, library, {
            require_native: require_native.bind(this),
            requireType: "Library"
        });
    }

    private findLibrary(identifier: string): string {
        const lib = this.pathUtil.join(this.libraryRoot, identifier);
        if (fs.readdirSync(lib).includes('manifest.json'))
            return this.pathUtil.join(lib, 'manifest.json');
        else
            throw new ImportError(`Manifest wasn't found`);
    }

    private libNameParser(libName: string): { library: string; root: string } {
        const fragments = libName.split('/');

        if (fragments[0]) {
            const lib = this.findLibrary(fragments[0]);

            if (!lib)
                throw new ImportError(`Library ${fragments[0]} was not recognised`);

            const config = JSON5.parse(fs.readFileSync(lib, 'utf8')) as Library;

            const entryPoint = this.pathUtil.join([this.pathUtil.up(lib), config.index]);

            if (!fs.existsSync(lib) || !fs.statSync(lib).isFile())
                throw new ImportError(`library ${fragments[0]} is not accessible or doesn't exist.`);
            else if (!config.index)
                throw new ImportError(`Manifest does not define library entry point`);
            else if (!fs.existsSync(entryPoint) && !fragments[1])
                throw new ImportError(`Entry point does not exist`);
            else if (config.displayName.toLowerCase() !== fragments[0].toLowerCase())
                throw new ImportError(`Mismatched names - ${fragments[0]} may be a bogus library`);
            else {
                if (fragments[1] && fragments[1] in config.modules)
                    return {
                        root: this.pathUtil.join([this.pathUtil.up(lib), config.index]),
                        library: this.pathUtil.join([this.pathUtil.up(lib), config.modules[fragments[1]]])
                    };
                else if (!fragments[1])
                    return {
                        root: this.pathUtil.join([this.pathUtil.up(lib), config.index]),
                        library: this.pathUtil.join([this.pathUtil.up(lib), config.index])
                    };
                else
                    throw new ImportError(`Unrecognised module '${fragments[1]}' on library '${config.displayName}'`);
            }
        } else return null;
    }
}

export default new LibraryLoader(false);
