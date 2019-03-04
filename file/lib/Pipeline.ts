import {
  BaseRequestPolicy,
  HttpClient as IHttpClient,
  HttpHeaders,
  HttpOperationResponse,
  HttpPipelineLogger as IHttpPipelineLogger,
  HttpPipelineLogLevel,
  HttpRequestBody,
  RequestPolicy,
  RequestPolicyFactory,
  RequestPolicyOptions,
  ServiceClientOptions,
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
  HttpRequestBody,
  WebResource,
  BaseRequestPolicy,
  RequestPolicyFactory,
  RequestPolicy,
  RequestPolicyOptions
};

export interface Pipeline extends ServiceClientOptions {
  requestPolicyFactories: RequestPolicyFactory[];
}
