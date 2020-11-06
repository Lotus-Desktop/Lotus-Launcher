import Permission from "./Permission";

/**
 * An interface showing the shape of a application manifest
 * @property displayName A non-critical, memorable identifier for an application
 * @property icon The path to the application's icon **directory**
 * @property entryPoint The file to bootstrap the launching operation
 * @property dependencies A list of dependencies the application requires - an application cannot access functionality provided by libraries unless they are listed here
 */
export interface Application {
    displayName: string,
    icon: string,
    entryPoint: string,
    requiresPermissions: Permission[],
    dependencies: string[]
}

/**
 * An interface showing the shape of a library manifest
 * @property displayName The token placed inside the `require` function to find the library - an identifier
 * @property index The location of the library's index - the entry point, essentially
 * @property dependencies A list of dependencies the library requires - a library cannot access functionality provided by other libraries unless they are listed here
 * @property requiresNative Specifies the requirement of a native `require` function (usable by require_native(<node module>), the library may access native functionality provided by `<node module>` should the user allow it.
 * @property modules A dictionary of modules and identifiers for use in the `require` function followed by a path to the module's entry point
 */
export interface Library {
    displayName: string,
    index: string,
    dependencies: string[],
    requiresNative: boolean,
    modules: {
        [name: string]: string
    }
}
