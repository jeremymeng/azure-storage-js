import {
  BaseRequestPolicy,
  HttpClient as IHttpClient,
  HttpHeaders,
  HttpOperationResponse,
  HttpPipelineLogger as IHttpPipelineLogger,
  HttpPipelineLogLevel,
  RequestPolicy,
  RequestPolicyFactory,
  RequestPolicyOptions,
  ServiceClientOptions as Pipeline,
  WebResource
} from "@azure/ms-rest-js";

// Export following interfaces and types for customers who want to implement their
// own RequestPolicy or HTTPClient
export {
  IHttpClient,
  IHttpPipelineLogger,
  HttpHeaders,
  HttpPipelineLogLevel,
  HttpOperationResponse,
  BaseRequestPolicy,
  Pipeline,
  RequestPolicyFactory,
  RequestPolicy,
  RequestPolicyOptions,
  WebResource
};

