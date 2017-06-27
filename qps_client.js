'use strict';

var fs = require('fs');
var hdr = require('hdr-histogram-js');
var profiler = require('v8-profiler');

var DynamicClient = require('./benchmark_client');
var StaticClient = require('./benchmark_static_client');

var SIXTY_SECONDS = 60 * 1000;
var TEN_MINUTES = 10 * 60 * 1000;

var program = require('commander');

program
    .version('0.0.1')

    .option('--address [STR]', 'Socket address (host:port) or Unix Domain Socket\n' +
    '                             file name (unix:///path/to/file), depending on\n' +
    '                             the transport selected.\n' +
    '                             [Required]\n')

    .option('--channels [INT]', 'Number of Channels.\n' +
    '                             [Default=4]\n', parseInt)

    .option('--outstanding_rpcs [INT]', 'Number of outstanding RPCs per Channel.\n' +
    '                             [Default=10]\n', parseInt)

    .option('--client_payload [BYTES]', 'Payload Size of the Request.\n' +
    '                             [Default=0]\n', parseInt)

    .option('--server_payload [BYTES]', 'Payload Size of the Response.\n' +
    '                             [Default=0]\n', parseInt)

    .option('--duration [SECONDS]', 'Duration of the benchmark.\n' +
    '                             [Default=60]\n', parseInt)

    .option('--warmup_duration [SECONDS]', 'Warmup Duration of the benchmark.\n' +
    '                             [Default=10]\n', parseInt)

    .option('--save_histogram [FILE]', 'Write the histogram with the latency recordings\n' +
    '                             to file.\n')

    .option('--profile [FILE]', 'Profile the run and write the output to file\n')

    .option('--static_client', 'Use codegen client instead of dynamic client\n')
    
    .parse(process.argv);

var address = program.address || 'localhost:8080';

if (!process.argv.slice(2).length || !address) {
    program.help();
}

var rpcType = 'UNARY';
var channels = program.channels || 1
var clientPayload = program.client_payload || 0;
var serverPayload = program.server_payload || 0
var outstandingRpcsPerChannel = program.outstanding_rpcs || 10;

var warmupDuration = program.warmup_duration || SIXTY_SECONDS;
var benchmarkDuration = program.profile ? SIXTY_SECONDS : (program.duration || TEN_MINUTES);

var profileOutputFile = program.profile;
var histogramOutputFile = program.save_histogram || 'histogram.txt';

function run(client, duration, cb) {
    client.startClosedLoop(duration, outstandingRpcsPerChannel, rpcType, clientPayload, serverPayload, cb);
}

function printStats(stats) {
    console.log("Channels:                       %s", stats.channels);
    console.log("Outstanding RPCs per Channel:   %s", stats.outstandingRpcsPerChannel);
    console.log("Server Payload Size:            %s", stats.serverPayload);
    console.log("Client Payload Size:            %s", stats.clientPayload);
    console.log("50%ile Latency (in micros):     %s", stats.histogram.percentile(50));
    console.log("90%ile Latency (in micros):     %s", stats.histogram.percentile(90));
    console.log("95%ile Latency (in micros):     %s", stats.histogram.percentile(95));
    console.log("99%ile Latency (in micros):     %s", stats.histogram.percentile(99));
    console.log("99.9%ile Latency (in micros):   %s", stats.histogram.percentile(99.9));
    console.log("Maximum Latency (in micros):    %s", stats.histogram.max());
    console.log("Request Count:                  %s", stats.count);
    console.log("QPS:                            %s", stats.qps);
    console.log("User Time:                      %s", stats.userTime);
    console.log("System Time:                    %s", stats.systemTime);
    console.log("Elapsed Time:                   %s", stats.elapsedTime);

    if (histogramOutputFile) {
        var hist = hdr.decodeFromCompressedBase64(stats.histogram.encode().toString());
        fs.writeFileSync(histogramOutputFile, hist.outputPercentileDistribution())
    }
}

function histogramDefaults() {
    return {
        lowestDiscernibleValue: 1,          // default value is also 1
        highestDiscernibleValue: 60000000,  // can increase up to nana seconds
        numberOfSignificantValueDigits: 3   // Number between 1 and 5 (inclusive)
    };
}

var client;

if (program.static_client) {
  console.log('--- Static Client ---');
  client = new StaticClient([address], channels, histogramDefaults());
} else {
  console.log('--- Dynamic Client ---');
  client = new DynamicClient([address], channels, histogramDefaults())
}

run(client, warmupDuration, function (client) {
    console.log('---  Wramup Stats ---');
    printStats(client.mark(true));

    program.profile && profiler.startProfiling('CPU Profile', true);

    run(client, benchmarkDuration, function (client) {
        var stats = client.mark();
        var profile = program.profile && profiler.stopProfiling();

        if (profile) {
            profile.export().pipe(fs.createWriteStream(profileOutputFile)).on('finish', function() {
                profile.delete();

                console.log('---  Benchmark Stats ---');
                printStats(stats);
                process.exit(0);
            });
        } else {
            console.log('---  Benchmark Stats ---');
            printStats(stats);
            process.exit(0);            
        }
    });
});