import * as os from 'os';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as assert from 'assert';
import * as tsjson from '../index';
const btools = require('@nbb.com/npmbuildtools');
const thisPackage = require('../package.json');

if (btools.TerminalCanBlock) {
    console.log('\u001b[2J'); // clear screen
}
if (!fs.existsSync(`${__filename}.map`)) {
    console.error(`There is no source map for this suite, so you won't be able to debug it! To change this, turn on the 'sourceMap' typescript compiler option in your 'tsconfig.json' file.`);
}

console.log('Running Mocha Test Suite ...');

describe(`${thisPackage.name} Load() tests`, function () {

    var jsonFile: string = path.join(os.tmpdir(), 'TestSettings.json');

    class TestClass1 {
        StringValue: string = '';
    }

    class TestClass2 {
        StringValue: string = '';
        NumberValue: number = 0;
    }

    before( function() {

    });

    after(() => {

    });

    it('should fail    without creating a file due to empty object', function(done: MochaDone) {
        if (fs.existsSync(jsonFile)) { fs.removeSync(jsonFile); }

        var target: object | undefined = undefined;
        btools.ConsoleCaptureStart();
        try {
            target = tsjson.Load(jsonFile, new Object());
            assert.fail('should have failed');
        } catch (error) {
            btools.ConsoleCaptureStop();
            assert.equal((<Error>error).message, `Object cannot be loaded because it doesn't contain any properties.`, `error message should contain`);
        }
        assert.equal(fs.existsSync(jsonFile), false, `File '${jsonFile}' should not exist`);
        assert.equal(target, undefined, `target should still be undefined`);
        assert.equal(btools.stdout.length, 0, `stdout shouldn't contain any lines`);
        assert.equal(btools.stderr.length, 0, `stderr shouldn't contain any lines`);

        done();
    });
    
    it('should fail    without creating a file due to invalid JSON file', function(done: MochaDone) {
        if (fs.existsSync(jsonFile)) { fs.removeSync(jsonFile); }
        // Create invalid file
        fs.writeFileSync(jsonFile, `{ "invalidJSON": }`);

        var target: TestClass1 | undefined = undefined;
        btools.ConsoleCaptureStart();
        try {
            target = tsjson.Load(jsonFile, new TestClass1());
            btools.ConsoleCaptureStop();
            assert.fail('should have failed');
        } catch (error) {
            btools.ConsoleCaptureStop();
            assert.equal((<Error>error).message, `${jsonFile}: Unexpected token } in JSON at position 17`, `error message should contain`);
        }
        assert.equal(fs.existsSync(jsonFile), true, `File '${jsonFile}' should still exist`);
        assert.equal(target, undefined, `target should still be undefined`);
        assert.equal(btools.stdout.length, 0, `stdout shouldn't contain any lines`);
        assert.equal(btools.stderr.length, 0, `stderr shouldn't contain any lines`);

        done();
    });
    
    it('should succeed without creating a file', function(done: MochaDone) {
        //this.timeout(10000);
        if (fs.existsSync(jsonFile)) { fs.removeSync(jsonFile); }

        var target: TestClass1 | undefined = undefined;
        btools.ConsoleCaptureStart();
        try {
            target = tsjson.Load(jsonFile, new TestClass1(), { verboseLogging: true, failOnFileNotFound: false });
            btools.ConsoleCaptureStop();
        } catch (error) {
            btools.ConsoleCaptureStop();
            assert.fail(`should not have failed with error [${<Error>error.message}]`);
        }
        assert.equal(fs.existsSync(jsonFile), false, `File '${jsonFile}' should not exist`);
        assert.notEqual(target, undefined, `target should not be undefined`);
        assert.equal(target.StringValue, '', `target's StringValue property should still be an empty string`);
        assert.equal(btools.stdout.length, 0, `stdout shouldn't contain any lines`);
        assert.equal(btools.stderr.length, 2, `stderr should contain exact number of lines`);
        assert.equal(btools.stderr[0], `Settings file '${jsonFile}' could not be found.\n`, `stderr first  line should contain`);
        assert.equal(btools.stderr[1], 'Object contains only default values.\n', `stderr second line should contain`);

        done();
    });
    
    it('should fail    without creating a file', function(done: MochaDone) {
        if (fs.existsSync(jsonFile)) { fs.removeSync(jsonFile); }

        var target: TestClass1 | undefined = undefined;
        btools.ConsoleCaptureStart();
        try {
            target = tsjson.Load(jsonFile, new TestClass1());
            btools.ConsoleCaptureStop();
            assert.fail('should have failed');
        } catch (error) {
            btools.ConsoleCaptureStop();
            assert.equal((<Error>error).message, `Settings file '${jsonFile}' could not be found.`, `error message should contain`);
        }
        assert.equal(fs.existsSync(jsonFile), false, `File '${jsonFile}' should not exist`);
        assert.equal(target, undefined, `target should still be undefined`);
        assert.equal(btools.stdout.length, 0, `stdout shouldn't contain any lines`);
        assert.equal(btools.stderr.length, 0, `stderr shouldn't contain any lines`);

        done();
    });
    
    it('should fail    without creating a file with supplied error text', function(done: MochaDone) {
        if (fs.existsSync(jsonFile)) { fs.removeSync(jsonFile); }

        var target: TestClass1 | undefined = undefined;
        var errTxt: string = `File missing.`;
        btools.ConsoleCaptureStart();
        try {
            target = tsjson.Load(jsonFile, new TestClass1(), { failOnFileNotFound: errTxt });
            btools.ConsoleCaptureStop();
            assert.fail('should have failed');
        } catch (error) {
            btools.ConsoleCaptureStop();
            assert.equal((<Error>error).message, errTxt, `error message should contain`);
        }
        assert.equal(fs.existsSync(jsonFile), false, `File '${jsonFile}' should not exist`);
        assert.equal(target, undefined, `target should still be undefined`);
        assert.equal(btools.stdout.length, 0, `stdout shouldn't contain any lines`);
        assert.equal(btools.stderr.length, 0, `stderr shouldn't contain any lines`);

        done();
    });
    
    it('should fail    without creating a file with supplied error object', function(done: MochaDone) {
        if (fs.existsSync(jsonFile)) { fs.removeSync(jsonFile); }

        var target: TestClass1 | undefined = undefined;
        var errObj: Error = Error(`File missing.`);
        btools.ConsoleCaptureStart();
        try {
            target = tsjson.Load(jsonFile, new TestClass1(), { failOnFileNotFound: errObj });
            btools.ConsoleCaptureStop();
            assert.fail('should have failed');
        } catch (error) {
            btools.ConsoleCaptureStop();
            assert.equal((<Error>error).message, errObj.message, `error message should contain`);
        }
        assert.equal(fs.existsSync(jsonFile), false, `File '${jsonFile}' should not exist`);
        assert.equal(target, undefined, `target should still be undefined`);
        assert.equal(btools.stdout.length, 0, `stdout shouldn't contain any lines`);
        assert.equal(btools.stderr.length, 0, `stderr shouldn't contain any lines`);

        done();
    });
    
    it('should fail    without creating a file due to object being default', function(done: MochaDone) {
        if (fs.existsSync(jsonFile)) { fs.removeSync(jsonFile); }

        var target: TestClass1 | undefined = undefined;
        btools.ConsoleCaptureStart();
        try {
            target = tsjson.Load(jsonFile, new TestClass1(), { failOnFileNotFound: false, failOnObjectIsDefault: true });
            btools.ConsoleCaptureStop();
            assert.fail('should have failed');
        } catch (error) {
            btools.ConsoleCaptureStop();
            assert.equal((<Error>error).message, 'Object contains only default values.', `error message should contain`);
        }
        assert.equal(fs.existsSync(jsonFile), false, `File '${jsonFile}' should not exist`);
        assert.equal(target, undefined, `target should still be undefined`);
        assert.equal(btools.stdout.length, 0, `stdout shouldn't contain any lines`);
        assert.equal(btools.stderr.length, 1, `stderr should contain exact number of lines`);
        assert.equal(btools.stderr[0], `Settings file '${jsonFile}' could not be found.\n`, `stderr first  line should contain`);

        done();
    });
    
    it('should fail    without creating a file due to object being default with supplied error text', function(done: MochaDone) {
        if (fs.existsSync(jsonFile)) { fs.removeSync(jsonFile); }

        var target: TestClass1 | undefined = undefined;
        var errTxt: string = `Object is default.`;
        btools.ConsoleCaptureStart();
        try {
            target = tsjson.Load(jsonFile, new TestClass1(), { failOnFileNotFound: false, failOnObjectIsDefault: errTxt });
            btools.ConsoleCaptureStop();
            assert.fail('should have failed');
        } catch (error) {
            btools.ConsoleCaptureStop();
            assert.equal((<Error>error).message, errTxt, `error message should contain`);
        }
        assert.equal(fs.existsSync(jsonFile), false, `File '${jsonFile}' should not exist`);
        assert.equal(target, undefined, `target should still be undefined`);
        assert.equal(btools.stdout.length, 0, `stdout shouldn't contain any lines`);
        assert.equal(btools.stderr.length, 1, `stderr should contain exact number of lines`);
        assert.equal(btools.stderr[0], `Settings file '${jsonFile}' could not be found.\n`, `stderr first  line should contain`);

        done();
    });
    
    it('should fail    without creating a file due to object being default with supplied error object', function(done: MochaDone) {
        if (fs.existsSync(jsonFile)) { fs.removeSync(jsonFile); }

        var target: TestClass1 | undefined = undefined;
        var errObj: Error = Error(`Object is default.`);
        btools.ConsoleCaptureStart();
        try {
            target = tsjson.Load(jsonFile, new TestClass1(), { failOnFileNotFound: false, failOnObjectIsDefault: errObj });
            btools.ConsoleCaptureStop();
            assert.fail('should have failed');
        } catch (error) {
            btools.ConsoleCaptureStop();
            assert.equal((<Error>error).message, errObj.message, `error message should contain`);
        }
        assert.equal(fs.existsSync(jsonFile), false, `File '${jsonFile}' should not exist`);
        assert.equal(target, undefined, `target should still be undefined`);
        assert.equal(btools.stdout.length, 0, `stdout shouldn't contain any lines`);
        assert.equal(btools.stderr.length, 1, `stderr should contain exact number of lines`);
        assert.equal(btools.stderr[0], `Settings file '${jsonFile}' could not be found.\n`, `stderr first  line should contain`);

        done();
    });
    
    it('should fail    having created a file but due to object being default', function(done: MochaDone) {
        if (fs.existsSync(jsonFile)) { fs.removeSync(jsonFile); }

        var target: TestClass1 | undefined = undefined;
        btools.ConsoleCaptureStart();
        try {
            target = tsjson.Load(jsonFile, new TestClass1(), { writeOnLoad: tsjson.WriteOnLoad.Create, failOnObjectIsDefault: true });
            btools.ConsoleCaptureStop();
            assert.fail('should have failed');
        } catch (error) {
            btools.ConsoleCaptureStop();
            assert.equal((<Error>error).message, `Settings file '${jsonFile}' didn't exist, but a scaffolding has been created.`, `error message should contain`);
        }
        assert.equal(fs.existsSync(jsonFile), true, `File '${jsonFile}' should exist`);
        assert.equal(target, undefined, `target should still be undefined`);
        assert.equal(btools.stdout.length, 0, `stdout shouldn't contain any lines`);
        assert.equal(btools.stderr.length, 0, `stderr shouldn't contain any lines`);

        done();
    });
    
    it('should succeed having created a file', function(done: MochaDone) {
        if (fs.existsSync(jsonFile)) { fs.removeSync(jsonFile); }

        var target: TestClass1 | undefined = undefined;
        btools.ConsoleCaptureStart();
        try {
            target = tsjson.Load(jsonFile, new TestClass1(), { writeOnLoad: tsjson.WriteOnLoad.Create, failOnFileNotFound: false });
            btools.ConsoleCaptureStop();
        } catch (error) {
            btools.ConsoleCaptureStop();
            assert.fail(`should not have failed with error [${<Error>error.message}]`);
        }
        assert.equal(fs.existsSync(jsonFile), true, `File '${jsonFile}' should exist`);
        assert.notEqual(target, undefined, `target should not be undefined`);
        assert.equal(btools.stdout.length, 0, `stdout shouldn't contain any lines`);
        assert.equal(btools.stderr.length, 2, `stderr should contain exact number of lines`);
        assert.equal(btools.stderr[0], `Settings file '${jsonFile}' didn't exist, but a scaffolding has been created.\n`, `stderr first  line should contain`);
        assert.equal(btools.stderr[1], 'Object contains only default values.\n', `stderr second line should contain`);

        done();
    });
    
    it('should succeed having found a file emitting verbose output', function(done: MochaDone) {
        if (fs.existsSync(jsonFile)) { fs.removeSync(jsonFile); }
        
        // Create a default file
        btools.ConsoleCaptureStart();
        tsjson.Load(jsonFile, new TestClass1(), { writeOnLoad: tsjson.WriteOnLoad.Create, failOnFileNotFound: false });
        btools.ConsoleCaptureStop();

        var target: TestClass1 | undefined = undefined;
        btools.ConsoleCaptureStart();
        try {
            target = tsjson.Load(jsonFile, new TestClass1(), { verboseLogging: true });
            btools.ConsoleCaptureStop();
        } catch (error) {
            btools.ConsoleCaptureStop();
            assert.fail(`should not have failed with error [${<Error>error.message}]`);
        }
        assert.equal(fs.existsSync(jsonFile), true, `File '${jsonFile}' should exist`);
        assert.notEqual(target, undefined, `target should not be undefined`);
        assert.equal(btools.stdout.length, 2, `stdout should contain exact number of lines`);
        assert.equal(btools.stdout[0], `Value '' of Property 'StringValue' in object remains unchanged due to value '' from file '${jsonFile}' being equal.\n`, `stdout first  line should contain`);
        assert.equal(btools.stdout[1], `File '${jsonFile}' won't be updated.\n`, `stdout second line should contain`);
        assert.equal(btools.stderr.length, 1, `stderr should contain exact number of lines`);
        assert.equal(btools.stderr[0], 'Object contains only default values.\n', `stderr first  line should contain`);

        done();
    });
    
    it('should fail    having found a file but due to object being default', function(done: MochaDone) {
        if (fs.existsSync(jsonFile)) { fs.removeSync(jsonFile); }
        
        // Create a default file
        btools.ConsoleCaptureStart();
        tsjson.Load(jsonFile, new TestClass1(), { writeOnLoad: tsjson.WriteOnLoad.Create, failOnFileNotFound: false });
        btools.ConsoleCaptureStop();

        var target: TestClass1 | undefined = undefined;
        btools.ConsoleCaptureStart();
        try {
            target = tsjson.Load(jsonFile, new TestClass1(), { failOnObjectIsDefault: true });
            btools.ConsoleCaptureStop();
            assert.fail('should have failed');
        } catch (error) {
            btools.ConsoleCaptureStop();
            assert.equal((<Error>error).message, `Object contains only default values.`, `error message should contain`);
        }
        assert.equal(fs.existsSync(jsonFile), true, `File '${jsonFile}' should exist`);
        assert.equal(target, undefined, `target should still be undefined`);
        assert.equal(btools.stdout.length, 0, `stdout shouldn't contain any lines`);
        assert.equal(btools.stderr.length, 0, `stderr shouldn't contain any lines`);

        done();
    });
    
    it('should succeed having found a file with 1 non-default value', function(done: MochaDone) {
        if (fs.existsSync(jsonFile)) { fs.removeSync(jsonFile); }
        
        // Create a default file
        btools.ConsoleCaptureStart();
        var targetDefault = tsjson.Load(jsonFile, new TestClass1(), { writeOnLoad: tsjson.WriteOnLoad.Create, failOnFileNotFound: false });
        btools.ConsoleCaptureStop();
        // Apply change to file
        targetDefault.StringValue = `non-default`;
        fs.writeJSONSync(jsonFile, targetDefault);

        var target: TestClass1 | undefined = undefined;
        btools.ConsoleCaptureStart();
        try {
            target = tsjson.Load(jsonFile, new TestClass1(), { verboseLogging: true });
            btools.ConsoleCaptureStop();
        } catch (error) {
            btools.ConsoleCaptureStop();
            assert.fail(`should not have failed with error [${<Error>error.message}]`);
        }
        assert.equal(fs.existsSync(jsonFile), true, `File '${jsonFile}' should exist`);
        assert.notEqual(target, undefined, `target should not be undefined`);
        assert.equal(btools.stdout.length, 2, `stdout should contain exact number of lines`);
        assert.equal(btools.stdout[0], `Value of Property 'StringValue' is set from '' to '${target.StringValue}'.\n`, `stdout first  line should contain`);
        assert.equal(btools.stdout[1], `File '${jsonFile}' won't be updated.\n`, `stdout second line should contain`);
        assert.equal(btools.stderr.length, 0, `stderr shouldn't contain any lines`);

        done();
    });
    
    it('should succeed having found a file with 1 unknown value', function(done: MochaDone) {
        if (fs.existsSync(jsonFile)) { fs.removeSync(jsonFile); }
        
        // Create a default file with different class TestClass2
        btools.ConsoleCaptureStart();
        var targetDefault = tsjson.Load(jsonFile, new TestClass2(), { writeOnLoad: tsjson.WriteOnLoad.Create, failOnFileNotFound: false });
        btools.ConsoleCaptureStop();
        // Apply change to file
        targetDefault.StringValue = 'non-default';
        fs.writeJSONSync(jsonFile, targetDefault);

        var target: TestClass1 | undefined = undefined;
        btools.ConsoleCaptureStart();
        try {
            target = tsjson.Load(jsonFile, new TestClass1(), { verboseLogging: true });
            btools.ConsoleCaptureStop();
        } catch (error) {
            btools.ConsoleCaptureStop();
            assert.fail(`should not have failed with error [${<Error>error.message}]`);
        }
        assert.equal(fs.existsSync(jsonFile), true, `File '${jsonFile}' should exist`);
        assert.notEqual(target, undefined, `target should not be undefined`);
        assert.equal(btools.stdout.length, 3, `stdout should contain exact number of lines`);
        assert.equal(btools.stdout[0], `Value of Property 'StringValue' is set from '' to '${target.StringValue}'.\n`, `stdout first  line should contain`);
        assert.equal(btools.stdout[1], `Property 'NumberValue' wasn't found in object and will be skipped.\n`, `stdout second line should contain`);
        assert.equal(btools.stdout[2], `File '${jsonFile}' won't be updated.\n`, `stdout third  line should contain`);
        assert.equal(btools.stderr.length, 0, `stderr shouldn't contain any lines`);

        done();
    });
    
    it('should succeed having found a file with 1 missing value', function(done: MochaDone) {
        if (fs.existsSync(jsonFile)) { fs.removeSync(jsonFile); }
        
        // Create a default file with different class TestClass1
        btools.ConsoleCaptureStart();
        var targetDefault = tsjson.Load(jsonFile, new TestClass1(), { writeOnLoad: tsjson.WriteOnLoad.Create, failOnFileNotFound: false });
        btools.ConsoleCaptureStop();
        // Apply change to file
        targetDefault.StringValue = 'non-default';
        fs.writeJSONSync(jsonFile, targetDefault);

        var target: TestClass1 | undefined = undefined;
        btools.ConsoleCaptureStart();
        try {
            target = tsjson.Load(jsonFile, new TestClass2(), { verboseLogging: true });
            btools.ConsoleCaptureStop();
        } catch (error) {
            btools.ConsoleCaptureStop();
            assert.fail(`should not have failed with error [${<Error>error.message}]`);
        }
        assert.equal(fs.existsSync(jsonFile), true, `File '${jsonFile}' should exist`);
        assert.notEqual(target, undefined, `target should not be undefined`);
        assert.equal(btools.stdout.length, 2, `stdout should contain exact number of lines`);
        assert.equal(btools.stdout[0], `Value of Property 'StringValue' is set from '' to '${target.StringValue}'.\n`, `stdout first  line should contain`);
        assert.equal(btools.stdout[1], `Value for property 'NumberValue' wasn't found in file '${jsonFile}'.\n`, `stdout second line should contain`);
        assert.equal(btools.stderr.length, 1, `stderr should contain exact number of lines`);
        assert.equal(btools.stderr[0], `Values are missing in file '${jsonFile}', but flag WriteOnLoad.Update has not been set in options.writeOnLoad.\n`, `stderr first  line should contain`);

        done();
    });
    
    it('should succeed having found a file with 1 unknown value having WriteOnLoad.Update set', function(done: MochaDone) {
        if (fs.existsSync(jsonFile)) { fs.removeSync(jsonFile); }
        
        // Create a default file with different class TestClass2
        btools.ConsoleCaptureStart();
        var targetDefault = tsjson.Load(jsonFile, new TestClass2(), { writeOnLoad: tsjson.WriteOnLoad.Create, failOnFileNotFound: false });
        btools.ConsoleCaptureStop();
        // Apply change to file
        targetDefault.StringValue = 'non-default';
        fs.writeJSONSync(jsonFile, targetDefault);

        var target: TestClass1 | undefined = undefined;
        btools.ConsoleCaptureStart();
        try {
            target = tsjson.Load(jsonFile, new TestClass1(), { verboseLogging: true, writeOnLoad: tsjson.WriteOnLoad.Update });
            btools.ConsoleCaptureStop();
        } catch (error) {
            btools.ConsoleCaptureStop();
            assert.fail(`should not have failed with error [${<Error>error.message}]`);
        }
        assert.equal(fs.existsSync(jsonFile), true, `File '${jsonFile}' should exist`);
        assert.notEqual(target, undefined, `target should not be undefined`);
        assert.equal(btools.stdout.length, 3, `stdout should contain exact number of lines`);
        assert.equal(btools.stdout[0], `Value of Property 'StringValue' is set from '' to '${target.StringValue}'.\n`, `stdout first  line should contain`);
        assert.equal(btools.stdout[1], `Property 'NumberValue' wasn't found in object and will be skipped.\n`, `stdout second line should contain`);
        assert.equal(btools.stdout[2], `File '${jsonFile}' doesn't need to be updated.\n`, `stdout third  line should contain`);
        assert.equal(btools.stderr.length, 0, `stderr shouldn't contain any lines`);

        done();
    });
    
    it('should succeed having found a file with 1 missing value having WriteOnLoad.Update set', function(done: MochaDone) {
        if (fs.existsSync(jsonFile)) { fs.removeSync(jsonFile); }
        
        // Create a default file with different class TestClass1
        btools.ConsoleCaptureStart();
        var targetDefault = tsjson.Load(jsonFile, new TestClass1(), { writeOnLoad: tsjson.WriteOnLoad.Create, failOnFileNotFound: false });
        btools.ConsoleCaptureStop();
        // Apply change to file
        targetDefault.StringValue = 'non-default';
        fs.writeJSONSync(jsonFile, targetDefault);

        var target: TestClass1 | undefined = undefined;
        btools.ConsoleCaptureStart();
        try {
            target = tsjson.Load(jsonFile, new TestClass2(), { verboseLogging: true, writeOnLoad: tsjson.WriteOnLoad.Update });
            btools.ConsoleCaptureStop();
        } catch (error) {
            btools.ConsoleCaptureStop();
            assert.fail(`should not have failed with error [${<Error>error.message}]`);
        }
        assert.equal(fs.existsSync(jsonFile), true, `File '${jsonFile}' should exist`);
        assert.notEqual(target, undefined, `target should not be undefined`);
        assert.equal(btools.stdout.length, 3, `stdout should contain exact number of lines`);
        assert.equal(btools.stdout[0], `Value of Property 'StringValue' is set from '' to '${target.StringValue}'.\n`, `stdout first  line should contain`);
        assert.equal(btools.stdout[1], `Value for property 'NumberValue' wasn't found in file '${jsonFile}'.\n`, `stdout second line should contain`);
        assert.equal(btools.stdout[2], `Updating file '${jsonFile}' due to missing values.\n`, `stdout third  line should contain`);
        assert.equal(btools.stderr.length, 0, `stderr shouldn't contain any lines`);

        done();
    });
    
});

describe(`${thisPackage.name} Readme should be up to date`, function() {
    it('CheckReadme() should succeed', function(done) {
        var packagePath = path.resolve('.');
        var readmeFileName = 'README.adoc';

        var result;
        btools.ConsoleCaptureStart();
        try {
            result = btools.CheckReadme(packagePath, readmeFileName, null, false);
            btools.ConsoleCaptureStop();
        } catch(err) {
            btools.ConsoleCaptureStop();
            throw err;
        }

        if (result) {
            assert.fail(`Readme file '${path.join(packagePath, readmeFileName)}' needs to be updated:\n${result}`);
        }

        done();
    });
});