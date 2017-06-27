/*
 *
 * Copyright 2015, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

/**
 * Benchmark client module
 * @module
 */

'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var EventEmitter = require('events');

var _ = require('lodash');
var grpc = require('grpc');
var async = require('async');
var Histogram = require('native-hdr-histogram')

var payloads = require('./static_codegen/payloads_pb.js');
var messages = require('./static_codegen/messages_pb.js');
var service = require('./static_codegen/services_grpc_pb.js');


/**
 * Create a buffer filled with size zeroes
 * @param {number} size The length of the buffer
 * @return {Buffer} The new buffer
 */
function zeroBuffer(size) {
  var zeros = new Buffer(size);
  zeros.fill(0);
  return zeros;
}

/**
 * Convert a time difference, as returned by process.hrtime, to a number of
 * nanoseconds.
 * @param {Array.<number>} time_diff The time diff, represented as
 *     [seconds, nanoseconds]
 * @return {number} The total number of nanoseconds
 */
function timeDiffToNanos(time_diff) {
  return time_diff[0] * 1e9 + time_diff[1];
}

function timeDiffToMicros(time_diff) {
  return (time_diff[0] * 1e6) + (time_diff[1] / 1000);
}

function newHistogram(config) {
  return new Histogram(config.lowestDiscernibleValue, config.highestDiscernibleValue, config.numberOfSignificantValueDigits);
}

/**
 * The BenchmarkClient class. Opens channels to servers and makes RPCs based on
 * parameters from the driver, and records statistics about those RPCs.
 * @param {Array.<string>} server_targets List of servers to connect to
 * @param {number} channels The total number of channels to open
 * @param {Object} histogram_params Options for setting up the histogram
 * @param {Object=} security_params Options for TLS setup. If absent, don't use
 *     TLS
 */
function BenchmarkClient(server_targets, channels, histogram_params, security_params) {
  var options = {
    "grpc.max_receive_message_length": -1,
    "grpc.max_send_message_length": -1
  };
  
  var creds = grpc.credentials.createInsecure();

  this.clients = [];
  for (var i = 0; i < channels; i++) {
    this.clients[i] = new service.BenchmarkServiceClient(
        server_targets[i % server_targets.length], creds, options);
  }

  this.calls = 0;
  this.running = false;
  this.pending_calls = 0;

  this.config = {
    channels: channels,
    lowestDiscernibleValue: histogram_params.lowestDiscernibleValue, 
    highestDiscernibleValue: histogram_params.highestDiscernibleValue,
    numberOfSignificantValueDigits: histogram_params.numberOfSignificantValueDigits
  }

  this.histogram = newHistogram(this.config);
};

util.inherits(BenchmarkClient, EventEmitter);

/**
 * Start every client in the list of clients by waiting for each to be ready,
 * then starting outstanding_rpcs_per_channel calls on each of them
 * @param {Array<grpc.Client>} client_list The list of clients
 * @param {Number} ougtstanding_rpcs_per_channel The number of calls to start
 *     on each client
 * @param {function(grpc.Client)} makeCall Function to make a single call on
 *     a single client
 * @param {EventEmitter} emitter The event emitter to send errors on, if
 *     necessary
 */
function startAllClients(client_list, outstanding_rpcs_per_channel, makeCall, emitter) {
  var ready_wait_funcs = _.map(client_list, function(client) {
    return _.partial(grpc.waitForClientReady, client, Infinity);
  });
  
  async.parallel(ready_wait_funcs, function(err) {
    if (err) {
      emitter.emit('error', err);
      return;
    }

    _.each(client_list, function(client) {
      _.times(outstanding_rpcs_per_channel, function() {
        makeCall(client);
      });
    });
  });
}

/**
 * Start a closed-loop test. For each channel, start
 * outstanding_rpcs_per_channel RPCs. Then, whenever an RPC finishes, start
 * another one.
 * @param {number} outstanding_rpcs_per_channel Number of RPCs to start per
 *     channel
 * @param {string} rpc_type Which method to call. Should be 'UNARY' or
 *     'STREAMING'
 * @param {number} req_size The size of the payload to send with each request
 * @param {number} resp_size The size of payload to request be sent in responses
 * @param {boolean} generic Indicates that the generic (non-proto) clients
 *     should be used
 */
BenchmarkClient.prototype.startClosedLoop = function(duration, outstanding_rpcs_per_channel, rpc_type, req_size, resp_size, cb) {
  var self = this;

  self.running = true;
  self.last_usage = process.cpuUsage();
  self.last_wall_time = process.hrtime();
  
  self.config.rpcType = rpc_type;
  self.config.clientPayload = req_size;
  self.config.serverPayload = resp_size;
  self.config.outstandingRpcsPerChannel = outstanding_rpcs_per_channel;

  self.config.endTime = Date.now() + duration;

  var makeCall;

 /*
  var argument = {
      response_size: resp_size,
      payload: {
        body: zeroBuffer(req_size)
      }
  }; */
  
  var payload = new messages.Payload();
  payload.setBody(zeroBuffer(req_size));

  var request = new messages.SimpleRequest();
  request.setResponseSize(resp_size);
  request.setPayload(payload);

  var client_list = self.clients;
  
  if (rpc_type == 'UNARY') {
    makeCall = function(client) {
      if (self.running) {
        self.calls++;
        self.pending_calls++;
        var start_time = process.hrtime();

        client.unaryCall(request, function(error, response) {
          if (error) {
            self.emit('error', new Error('Client error: ' + error.message));
            self.running = false;
            return;
          }

          var time_diff = process.hrtime(start_time);
          time_diff = timeDiffToMicros(time_diff);
          self.histogram.record(time_diff);
          
          if (self.config.endTime > Date.now()) {
            makeCall(client);
          } else {
            self.running = false;
          }
          
          self.pending_calls--;
          if ((!self.running) && self.pending_calls == 0) {
            self.emit('finished');
            cb(self);
          }
        });
      }
    };
  } else {
    makeCall = function(client) {
      if (self.running) {
        self.calls++;
        self.pending_calls++;
        var start_time = process.hrtime();
        
        var call = client.streamingCall();
        call.write(request);
        call.on('data', function() {
        });
        call.on('end', function() {
          var time_diff = process.hrtime(start_time);
          self.histogram.record(timeDiffToMicros(time_diff));

          if (self.config.endTime > Date.now()) {
            makeCall(client);
          } else {
            self.running = false;
          }

          self.pending_calls--;
          if ((!self.running) && self.pending_calls == 0) {
            self.emit('finished');
            cb(self);
          }
        });
        call.on('error', function(error) {
          self.emit('error', new Error('Client error: ' + error.message));
          self.running = false;
        });
      }
    };
  }

  startAllClients(client_list, outstanding_rpcs_per_channel, makeCall, self);
};

/**
 * Return curent statistics for the client. If reset is set, restart
 * statistic collection.
 * @param {boolean} reset Indicates that statistics should be reset
 * @return {object} Client statistics
 */
BenchmarkClient.prototype.mark = function(reset) {
  var wall_time_diff = process.hrtime(this.last_wall_time);
  var usage_diff = process.cpuUsage(this.last_usage);
  var histogram = this.histogram;
 
  var stats =  {
    count: this.calls,
    histogram: this.histogram,
    userTime: usage_diff.user / 1000000,
    systemTime: usage_diff.system / 1000000,
    elapsedTime: wall_time_diff[0] + wall_time_diff[1] / 1e9,

    rpcType: this.config.rpcType,
    channels: this.config.channels,
    clientPayload: this.config.clientPayload,
    serverPayload: this.config.serverPayload,
    outstandingRpcsPerChannel: this.config.outstandingRpcsPerChannel
  };

  stats.qps = this.calls / stats.elapsedTime;

  if (reset) {
    this.calls = 0;
    this.last_usage = process.cpuUsage();
    this.last_wall_time = process.hrtime();
    this.histogram = newHistogram(this.config);
  }

  return stats;
};

/**
 * Stop the clients.
 * @param {function} callback Called when the clients have finished shutting
 *     down
 */
BenchmarkClient.prototype.stop = function(callback) {
  this.running = false;
  callback && this.once('finished', callback.bind(null, this));
};

module.exports = BenchmarkClient;
