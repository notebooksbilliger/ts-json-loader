import * as tsjson from '@nbb.com/ts-json-loader';

class MySettings {
    StringValue: string = `Short description used as the default value in newly created JSON file`;
}

var mySettings = tsjson.Load('./mySettings.json', new MySettings(), { writeOnLoad: tsjson.WriteOnLoad.Create, failOnFileNotFound: false });