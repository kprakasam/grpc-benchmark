// GENERATED CODE -- DO NOT EDIT!

// Original file comments:
// Copyright 2015, Google Inc.
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
//     * Neither the name of Google Inc. nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// An integration test service that covers all the method signature permutations
// of unary/streaming requests/responses.
'use strict';
var grpc = require('grpc');
var messages_pb = require('./messages_pb.js');
var control_pb = require('./control_pb.js');

function serialize_grpc_testing_ClientArgs(arg) {
  if (!(arg instanceof control_pb.ClientArgs)) {
    throw new Error('Expected argument of type grpc.testing.ClientArgs');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpc_testing_ClientArgs(buffer_arg) {
  return control_pb.ClientArgs.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpc_testing_ClientStatus(arg) {
  if (!(arg instanceof control_pb.ClientStatus)) {
    throw new Error('Expected argument of type grpc.testing.ClientStatus');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpc_testing_ClientStatus(buffer_arg) {
  return control_pb.ClientStatus.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpc_testing_CoreRequest(arg) {
  if (!(arg instanceof control_pb.CoreRequest)) {
    throw new Error('Expected argument of type grpc.testing.CoreRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpc_testing_CoreRequest(buffer_arg) {
  return control_pb.CoreRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpc_testing_CoreResponse(arg) {
  if (!(arg instanceof control_pb.CoreResponse)) {
    throw new Error('Expected argument of type grpc.testing.CoreResponse');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpc_testing_CoreResponse(buffer_arg) {
  return control_pb.CoreResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpc_testing_ScenarioResult(arg) {
  if (!(arg instanceof control_pb.ScenarioResult)) {
    throw new Error('Expected argument of type grpc.testing.ScenarioResult');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpc_testing_ScenarioResult(buffer_arg) {
  return control_pb.ScenarioResult.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpc_testing_ServerArgs(arg) {
  if (!(arg instanceof control_pb.ServerArgs)) {
    throw new Error('Expected argument of type grpc.testing.ServerArgs');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpc_testing_ServerArgs(buffer_arg) {
  return control_pb.ServerArgs.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpc_testing_ServerStatus(arg) {
  if (!(arg instanceof control_pb.ServerStatus)) {
    throw new Error('Expected argument of type grpc.testing.ServerStatus');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpc_testing_ServerStatus(buffer_arg) {
  return control_pb.ServerStatus.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpc_testing_SimpleRequest(arg) {
  if (!(arg instanceof messages_pb.SimpleRequest)) {
    throw new Error('Expected argument of type grpc.testing.SimpleRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpc_testing_SimpleRequest(buffer_arg) {
  return messages_pb.SimpleRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpc_testing_SimpleResponse(arg) {
  if (!(arg instanceof messages_pb.SimpleResponse)) {
    throw new Error('Expected argument of type grpc.testing.SimpleResponse');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpc_testing_SimpleResponse(buffer_arg) {
  return messages_pb.SimpleResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpc_testing_Void(arg) {
  if (!(arg instanceof control_pb.Void)) {
    throw new Error('Expected argument of type grpc.testing.Void');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpc_testing_Void(buffer_arg) {
  return control_pb.Void.deserializeBinary(new Uint8Array(buffer_arg));
}


var BenchmarkServiceService = exports.BenchmarkServiceService = {
  // One request followed by one response.
  // The server returns the client payload as-is.
  unaryCall: {
    path: '/grpc.testing.BenchmarkService/UnaryCall',
    requestStream: false,
    responseStream: false,
    requestType: messages_pb.SimpleRequest,
    responseType: messages_pb.SimpleResponse,
    requestSerialize: serialize_grpc_testing_SimpleRequest,
    requestDeserialize: deserialize_grpc_testing_SimpleRequest,
    responseSerialize: serialize_grpc_testing_SimpleResponse,
    responseDeserialize: deserialize_grpc_testing_SimpleResponse,
  },
  // Repeated sequence of one request followed by one response.
  // Should be called streaming ping-pong
  // The server returns the client payload as-is on each response
  streamingCall: {
    path: '/grpc.testing.BenchmarkService/StreamingCall',
    requestStream: true,
    responseStream: true,
    requestType: messages_pb.SimpleRequest,
    responseType: messages_pb.SimpleResponse,
    requestSerialize: serialize_grpc_testing_SimpleRequest,
    requestDeserialize: deserialize_grpc_testing_SimpleRequest,
    responseSerialize: serialize_grpc_testing_SimpleResponse,
    responseDeserialize: deserialize_grpc_testing_SimpleResponse,
  },
  // Single-sided unbounded streaming from client to server
  // The server returns the client payload as-is once the client does WritesDone
  streamingFromClient: {
    path: '/grpc.testing.BenchmarkService/StreamingFromClient',
    requestStream: true,
    responseStream: false,
    requestType: messages_pb.SimpleRequest,
    responseType: messages_pb.SimpleResponse,
    requestSerialize: serialize_grpc_testing_SimpleRequest,
    requestDeserialize: deserialize_grpc_testing_SimpleRequest,
    responseSerialize: serialize_grpc_testing_SimpleResponse,
    responseDeserialize: deserialize_grpc_testing_SimpleResponse,
  },
  // Single-sided unbounded streaming from server to client
  // The server repeatedly returns the client payload as-is
  streamingFromServer: {
    path: '/grpc.testing.BenchmarkService/StreamingFromServer',
    requestStream: false,
    responseStream: true,
    requestType: messages_pb.SimpleRequest,
    responseType: messages_pb.SimpleResponse,
    requestSerialize: serialize_grpc_testing_SimpleRequest,
    requestDeserialize: deserialize_grpc_testing_SimpleRequest,
    responseSerialize: serialize_grpc_testing_SimpleResponse,
    responseDeserialize: deserialize_grpc_testing_SimpleResponse,
  },
  // Two-sided unbounded streaming between server to client
  // Both sides send the content of their own choice to the other
  streamingBothWays: {
    path: '/grpc.testing.BenchmarkService/StreamingBothWays',
    requestStream: true,
    responseStream: true,
    requestType: messages_pb.SimpleRequest,
    responseType: messages_pb.SimpleResponse,
    requestSerialize: serialize_grpc_testing_SimpleRequest,
    requestDeserialize: deserialize_grpc_testing_SimpleRequest,
    responseSerialize: serialize_grpc_testing_SimpleResponse,
    responseDeserialize: deserialize_grpc_testing_SimpleResponse,
  },
};

exports.BenchmarkServiceClient = grpc.makeGenericClientConstructor(BenchmarkServiceService);
var WorkerServiceService = exports.WorkerServiceService = {
  // Start server with specified workload.
  // First request sent specifies the ServerConfig followed by ServerStatus
  // response. After that, a "Mark" can be sent anytime to request the latest
  // stats. Closing the stream will initiate shutdown of the test server
  // and once the shutdown has finished, the OK status is sent to terminate
  // this RPC.
  runServer: {
    path: '/grpc.testing.WorkerService/RunServer',
    requestStream: true,
    responseStream: true,
    requestType: control_pb.ServerArgs,
    responseType: control_pb.ServerStatus,
    requestSerialize: serialize_grpc_testing_ServerArgs,
    requestDeserialize: deserialize_grpc_testing_ServerArgs,
    responseSerialize: serialize_grpc_testing_ServerStatus,
    responseDeserialize: deserialize_grpc_testing_ServerStatus,
  },
  // Start client with specified workload.
  // First request sent specifies the ClientConfig followed by ClientStatus
  // response. After that, a "Mark" can be sent anytime to request the latest
  // stats. Closing the stream will initiate shutdown of the test client
  // and once the shutdown has finished, the OK status is sent to terminate
  // this RPC.
  runClient: {
    path: '/grpc.testing.WorkerService/RunClient',
    requestStream: true,
    responseStream: true,
    requestType: control_pb.ClientArgs,
    responseType: control_pb.ClientStatus,
    requestSerialize: serialize_grpc_testing_ClientArgs,
    requestDeserialize: deserialize_grpc_testing_ClientArgs,
    responseSerialize: serialize_grpc_testing_ClientStatus,
    responseDeserialize: deserialize_grpc_testing_ClientStatus,
  },
  // Just return the core count - unary call
  coreCount: {
    path: '/grpc.testing.WorkerService/CoreCount',
    requestStream: false,
    responseStream: false,
    requestType: control_pb.CoreRequest,
    responseType: control_pb.CoreResponse,
    requestSerialize: serialize_grpc_testing_CoreRequest,
    requestDeserialize: deserialize_grpc_testing_CoreRequest,
    responseSerialize: serialize_grpc_testing_CoreResponse,
    responseDeserialize: deserialize_grpc_testing_CoreResponse,
  },
  // Quit this worker
  quitWorker: {
    path: '/grpc.testing.WorkerService/QuitWorker',
    requestStream: false,
    responseStream: false,
    requestType: control_pb.Void,
    responseType: control_pb.Void,
    requestSerialize: serialize_grpc_testing_Void,
    requestDeserialize: deserialize_grpc_testing_Void,
    responseSerialize: serialize_grpc_testing_Void,
    responseDeserialize: deserialize_grpc_testing_Void,
  },
};

exports.WorkerServiceClient = grpc.makeGenericClientConstructor(WorkerServiceService);
var ReportQpsScenarioServiceService = exports.ReportQpsScenarioServiceService = {
  // Report results of a QPS test benchmark scenario.
  reportScenario: {
    path: '/grpc.testing.ReportQpsScenarioService/ReportScenario',
    requestStream: false,
    responseStream: false,
    requestType: control_pb.ScenarioResult,
    responseType: control_pb.Void,
    requestSerialize: serialize_grpc_testing_ScenarioResult,
    requestDeserialize: deserialize_grpc_testing_ScenarioResult,
    responseSerialize: serialize_grpc_testing_Void,
    responseDeserialize: deserialize_grpc_testing_Void,
  },
};

exports.ReportQpsScenarioServiceClient = grpc.makeGenericClientConstructor(ReportQpsScenarioServiceService);
