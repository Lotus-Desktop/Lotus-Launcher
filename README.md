# Lotus-Launcher
A container for launching and securing applications to their own unique contexts as well as providing customised import behaviours.

The launcher is a NodeJS program like any other. It is written in TypeScript and thus needs to be compiled. This is easy. 

```
$ pnpm i
$ pnpx tsc
```
The output is placed in the `./build` directory.

To invoke the launcher and start applications, each critirium must be met:

- A system-wide accessible directory (not within `/home/*`) must exist with read-write permissions to the current user in a known location for library installation.
- NodeJS 14+ be installed.
- All applications and libraries contain a `manifest.json` file at their root (`/`).
- All libraries must be registered and accepted by the user.
- All native libraries must be installed by user.
- Application must be granted access to each requested library (specified within manifest) (Extra permission is required for native libraries)
- Application manifest is specified to the program and contains an `entryPoint` value to a valid JavaScript file.

### Things to note:

* Application and Library permissions do not function yet and are granted regardless of circumstances. Applications are launched at your own risk. 
* Libraries must be installed manually as no package manager exists yet.
* Libraries can be installed freely as permission management does not function yet.
* Framewors and libraries are currently **very** limited and highly in development. Do not use for production purposes yet.

## To Launch Applications

Launching is quite simple. Once all criteria listed above have been met, the following command may be used to invoke an application:

```
$ /usr/bin/node <...NodeJS Parameters> ~/Lotus/Launcher/build/launcher.js <...Launch Parameters> ~/Applications/HelloWorld/manifest.json <...Application Parameters>
```
> To view available NodeJS Parameters, [See the Node.JS Docs](https://nodejs.org/dist/latest-v15.x/docs/api/cli.html#cli_command_line_options)

#### Launch Parameters:
* `--trace-imports`: Prints a list of every imported file and the resolved path for each import
* `--use-relative`: Uses relative paths in module invocation. Useful for debugging purposes as NodeJS debugging is not supported yet
* `--libs=<library_root>`: Specifies the location of the directory containing system-wide libraries. Default is `/usr/lib/lotus/`

# Bugs
If (when) you find bugs, please report them under the [Issues tab](https://github.com/Lotus-Desktop/Lotus-Launcher/issues)

Contributions are most welcome, however, be warned, the codebase is a mess.
