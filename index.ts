import * as fs from 'fs-extra';
import btools from '@nbb.com/npmbuildtools';

/**Actions to take in specific situations `Load()` may face.*/
export enum WriteOnLoad {
    /**Do not create nor update the requested JSON file*/
    None = 0,
    /**Create the requested file if it doesn't exit*/
    Create = 1,
    /**Rewrite the requested file if it is missing one or more property values*/
    Update = 2,
}

/**Options to specify in calls of `Load()`.*/
export class LoadOptions {
    /**Write behaviour of `Load()`,
     * see `WriteOnLoad`.*/
    writeOnLoad?: WriteOnLoad;
    /** **Deprecated**, use `consoleOptions` member instead! */
    verboseLogging?: boolean;
    /**Controls how much information will be emitted to `stdout`. */
    consoleOptions?: btools.ConsoleOptions;
    /**Controls whether to `thow` an `Error` if the requested
     * file culd not be found (even if it has been created
     * according to `writeOnLoad`)
     * - If set to an `Error` object, this object will be thrown
     * - If set to a `string` value, an `Error` object with that
     * message will be created and thrown
     * - If set to `boolean` value `true`, an `Error` with a
     * default message will be thrown
     */
    failOnFileNotFound?: boolean | Error | string;
    /**Controls whether to `thow` an `Error` if the requested
     * file contains only default values (i.e. values that would
     * be present if the file was newly created from an unchanged
     * object)
     * - If set to an `Error` object, this object will be thrown
     * - If set to a `string` value, an `Error` object with that
     * message will be created and thrown
     * - If set to `boolean` value `true`, an `Error` with a
     * default message will be thrown
     */
    failOnObjectIsDefault?: boolean | Error | string;
}

/**Loads property values from a JSON file into an _existing_ object.
 * 
 * ---
 * @typeparam `T` The type to load properties for
 * @param file The file to read
 * @param object The object to load properties for
 * @param options `LoadOptions` controlling file and error handling as well as log verbosity
 * 
 * ---
 * This function returns instances of objects, in contrast to
 * [`JSON.parse()`](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
 * which returns `any`.
 */
export function Load<T extends object>(file: string, object: T, options?: LoadOptions): T {

    if (!options) { options = new LoadOptions(); }

    var optionsKeys: string[] = Object.keys(options);
    options.verboseLogging = optionsKeys.includes('verboseLogging') ? options.verboseLogging : false;

    options.consoleOptions = btools.ConsolePushOptions(options.consoleOptions);
    if (optionsKeys.includes('verboseLogging')) {
        console.warn(`The 'verboseLogging' member of the 'LoadOptions' class is deprecated and may be removed with the next major version update. Use the 'consoleOptions' member instead.`)
        if (options.verboseLogging && !options.consoleOptions.verbose) {
            btools.ConsolePopOptions()
            options.consoleOptions.verbose = true;
            options.consoleOptions = btools.ConsolePushOptions(options.consoleOptions);
        }
    }

    var result;
    try {
        result = load(file, object, options);
    } finally {
        btools.ConsolePopOptions();
    }
    return result;
}

function load<T extends object>(file: string, object: T, options: LoadOptions): T {
    var objectKeys = Object.keys(object);
    if (objectKeys.length < 1) { throw Error(`Object cannot be loaded because it doesn't contain any properties.`); }

    var optionsKeys: string[] = Object.keys(options);
    options.writeOnLoad = optionsKeys.includes('writeOnLoad') ? <WriteOnLoad>options.writeOnLoad : WriteOnLoad.None;
    options.failOnFileNotFound = optionsKeys.includes('failOnFileNotFound') ? options.failOnFileNotFound : true;
    options.failOnObjectIsDefault = optionsKeys.includes('failOnObjectIsDefault') ? options.failOnObjectIsDefault : false;

    if (!fs.existsSync(file)) {
        var failOnFileNotFound: boolean = false;
        if (typeof(options.failOnFileNotFound) == 'string') {
            options.failOnFileNotFound = new Error(options.failOnFileNotFound);
        }
        if (options.failOnFileNotFound instanceof Error) {
            failOnFileNotFound = true;
        } else {
            failOnFileNotFound = options.failOnFileNotFound || false;
        }
        if (options.writeOnLoad & WriteOnLoad.Create) {
            fs.writeFileSync(file, JSON.stringify(object, null, 4), { encoding: 'utf8' });
            if (!(options.failOnFileNotFound instanceof Error)) { options.failOnFileNotFound = new Error(`Settings file '${file}' didn't exist, but a scaffolding has been created.`); }
        } else {
            if (!(options.failOnFileNotFound instanceof Error)) { options.failOnFileNotFound = new Error(`Settings file '${file}' could not be found.`); }
        }
        if (failOnFileNotFound) {
            throw options.failOnFileNotFound;
        } else {
            console.error(options.failOnFileNotFound.message);
        }
    }

    var failOnObjectIsDefault: boolean = false;
    if (typeof(options.failOnObjectIsDefault) == 'string') {
        options.failOnObjectIsDefault = new Error(options.failOnObjectIsDefault);
    }
    if (options.failOnObjectIsDefault instanceof Error) {
        failOnObjectIsDefault = true;
    } else {
        failOnObjectIsDefault = options.failOnObjectIsDefault || false;
        options.failOnObjectIsDefault = new Error(`Object contains only default values.`)
    }
    
    if (!fs.existsSync(file)) {
        if (failOnObjectIsDefault) {
            throw options.failOnObjectIsDefault;
        } else {
            console.error(options.failOnObjectIsDefault.message)
            return object;
        }
    }

    var needsUpdate: boolean = false;
    var onlyDefault: boolean = true;
    var result = fs.readJSONSync(file);
    var resultKeys = Object.keys(result);
    var keys = [...new Set([...objectKeys, ...resultKeys])];
    keys.forEach(key => {
        if (resultKeys.includes(key)) {
            if (objectKeys.includes(key)) {
                var resultValue = result[key];
                var objectValue = Reflect.get(object, key);
                if (resultValue === objectValue) {
                    console.debug(`Value '${objectValue}' of Property '${key}' in object remains unchanged due to value '${resultValue}' from file '${file}' being equal.`);
                } else {
                    console.debug(`Value of Property '${key}' is set from '${objectValue}' to '${resultValue}'.`);
                    Reflect.set(object, key, resultValue);
                    onlyDefault = false;
                }
            } else {
                console.debug(`Property '${key}' wasn't found in object and will be skipped.`);
                onlyDefault = false;
            }
        } else {
            console.debug(`Value for property '${key}' wasn't found in file '${file}'.`);
            needsUpdate = true;
        }
    });

    if (onlyDefault) {
        if (failOnObjectIsDefault) {
            throw options.failOnObjectIsDefault;
        } else {
            console.error(options.failOnObjectIsDefault.message)
        }
    }

    if (needsUpdate) {
        if (options.writeOnLoad & WriteOnLoad.Update) {
            console.info(`Updating file '${file}' due to missing values.`);
            fs.writeFileSync(file, JSON.stringify(object, null, 4), { encoding: 'utf8' });
        } else {
            console.warn(`Values are missing in file '${file}', but flag WriteOnLoad.Update has not been set in options.writeOnLoad.`);
        }
    } else {
        if (options.writeOnLoad & WriteOnLoad.Update) {
            console.debug(`File '${file}' doesn't need to be updated.`);
        } else {
            console.info(`File '${file}' won't be updated.`);
        }
    }

    return object;
}
