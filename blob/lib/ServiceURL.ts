import * as Models from "../lib/generated/lib/models";
import { Aborter } from "./Aborter";
import { ListContainersIncludeType } from "./generated/lib/models/index";
import { Service } from "./generated/lib/operations";
import { Pipeline } from "./Pipeline";
import { StorageURL } from "./StorageURL";
import { ItemLists } from './ItemLists';

export interface IServiceListContainersSegmentOptions {
  /**
   * @member {string} [prefix] Filters the results to return only containers
   * whose name begins with the specified prefix.
   */
  prefix?: string;
  /**
   * @member {number} [maxresults] Specifies the maximum number of containers
   * to return. If the request does not specify maxresults, or specifies a
   * value greater than 5000, the server will return up to 5000 items. Note
   * that if the listing operation crosses a partition boundary, then the
   * service will return a continuation token for retrieving the remainder of
   * the results. For this reason, it is possible that the service will return
   * fewer results than specified by maxresults, or than the default of 5000.
   */
  maxresults?: number;
  /**
   * @member {ListContainersIncludeType} [include] Include this parameter to
   * specify that the container's metadata be returned as part of the response
   * body. Possible values include: 'metadata'
   */
  include?: ListContainersIncludeType;
}

/**
 * A ServiceURL represents a URL to the Azure Storage Blob service allowing you
 * to manipulate blob containers.
 *
 * @export
 * @class ServiceURL
 * @extends {StorageURL}
 */
export class ServiceURL extends StorageURL {
  /**
   * serviceContext provided by protocol layer.
   *
   * @private
   * @type {Service}
   * @memberof ServiceURL
   */
  private serviceContext: Service;

  /**
   * Creates an instance of ServiceURL.
   *
   * @param {string} url A URL string pointing to Azure Storage blob service, such as
   *                     "https://myaccount.blob.core.windows.net". You can append a SAS
   *                     if using AnonymousCredential, such as "https://myaccount.blob.core.windows.net?sasString".
   * @param {Pipeline} pipeline Call StorageURL.newPipeline() to create a default
   *                            pipeline, or provide a customized pipeline.
   * @memberof ServiceURL
   */
  constructor(url: string, pipeline: Pipeline) {
    super(url, pipeline);
    this.serviceContext = new Service(this.storageClientContext);
  }

  /**
   * Creates a new ServiceURL object identical to the source but with the
   * specified request policy pipeline.
   *
   * @param {Pipeline} pipeline
   * @returns {ServiceURL}
   * @memberof ServiceURL
   */
  public withPipeline(pipeline: Pipeline): ServiceURL {
    return new ServiceURL(this.url, pipeline);
  }

  /**
   * Gets the properties of a storage account’s Blob service, including properties
   * for Storage Analytics and CORS (Cross-Origin Resource Sharing) rules.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/get-blob-service-properties}
   *
   * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
   *                          goto documents of Aborter for more examples about request cancellation
   * @returns {Promise<Models.ServiceGetPropertiesResponse>}
   * @memberof ServiceURL
   */
  public async getProperties(
    aborter: Aborter
  ): Promise<Models.ServiceGetPropertiesResponse> {
    return this.serviceContext.getProperties({
      abortSignal: aborter
    });
  }

  /**
   * Sets properties for a storage account’s Blob service endpoint, including properties
   * for Storage Analytics, CORS (Cross-Origin Resource Sharing) rules and soft delete settings.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/set-blob-service-properties}
   *
   * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
   *                          goto documents of Aborter for more examples about request cancellation
   * @param {Models.StorageServiceProperties} properties
   * @returns {Promise<Models.ServiceSetPropertiesResponse>}
   * @memberof ServiceURL
   */
  public async setProperties(
    aborter: Aborter,
    properties: Models.StorageServiceProperties
  ): Promise<Models.ServiceSetPropertiesResponse> {
    return this.serviceContext.setProperties(properties, {
      abortSignal: aborter
    });
  }

  /**
   * Retrieves statistics related to replication for the Blob service. It is only
   * available on the secondary location endpoint when read-access geo-redundant
   * replication is enabled for the storage account.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/get-blob-service-stats}
   *
   *  @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
   *                          goto documents of Aborter for more examples about request cancellation
   * @returns {Promise<Models.ServiceGetStatisticsResponse>}
   * @memberof ServiceURL
   */
  public async getStatistics(
    aborter: Aborter
  ): Promise<Models.ServiceGetStatisticsResponse> {
    return this.serviceContext.getStatistics({
      abortSignal: aborter
    });
  }

  /**
   * The Get Account Information operation returns the sku name and account kind
   * for the specified account.
   * The Get Account Information operation is available on service versions beginning
   * with version 2018-03-28.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/get-account-information
   *
   * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
   *                          goto documents of Aborter for more examples about request cancellation
   * @returns {Promise<Models.ServiceGetAccountInfoResponse>}
   * @memberof ServiceURL
   */
  public async getAccountInfo(
    aborter: Aborter
  ): Promise<Models.ServiceGetAccountInfoResponse> {
    return this.serviceContext.getAccountInfo({
      abortSignal: aborter
    });
  }

  /**
   * Returns a list of the containers under the specified account.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/list-containers2
   *
   * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
   *                          goto documents of Aborter for more examples about request cancellation
   * @param {string} [marker] A string value that identifies the portion of
   *                          the list of containers to be returned with the next listing operation. The
   *                          operation returns the NextMarker value within the response body if the
   *                          listing operation did not return all containers remaining to be listed
   *                          with the current page. The NextMarker value can be used as the value for
   *                          the marker parameter in a subsequent call to request the next page of list
   *                          items. The marker value is opaque to the client.
   * @param {IServiceListContainersSegmentOptions} [options]
   * @returns {Promise<Models.ServiceListContainersSegmentResponse>}
   * @memberof ServiceURL
   */
  public async listContainersSegment(
    aborter: Aborter,
    marker?: string,
    options: IServiceListContainersSegmentOptions = {}
  ): Promise<Models.ServiceListContainersSegmentResponse> {
    return this.serviceContext.listContainersSegment({
      abortSignal: aborter,
      marker,
      ...options
    });
  }

  public async *listSegments(
    aborter: Aborter,
    options: IServiceListContainersSegmentOptions = {}
  ): AsyncIterableIterator<Models.ServiceListContainersSegmentResponse> {
    let marker: string | undefined;
    do {
      // TODO: do we need to handle abort signal?
      yield await this.listContainersSegment(aborter, marker, options);
    } while (marker)
  }

  public async *listItems(
    aborter: Aborter,
    options: IServiceListContainersSegmentOptions = {}
  ): AsyncIterableIterator<Models.ContainerItem> {
    for await (const segment of this.listSegments(aborter, options)) {
      // TODO: do we need to handle abort signal?
      yield* segment.containerItems;
    }
  }

  public listAll(
    aborter: Aborter,
    options: IServiceListContainersSegmentOptions = {}
  ) {
    return {
      [Symbol.asyncIterator]: () => this.listItems(aborter, options),
      Segments: () => this.listSegments(aborter, options),
      then(
        onfulfiled?: ((value: Models.ContainerItem[]) => Models.ContainerItem[] | PromiseLike<Models.ContainerItem[]>) | undefined | null,
        onrejected?: ((reason: any) => never | PromiseLike<never>) | undefined | null) {
        let all: Models.ContainerItem[] = [];
        return new Promise<Models.ContainerItem[]>(async (resolve) => {
          for await (const segment of this.Segments()) {
            all = all.concat(segment.containerItems);
          }
          resolve(all);
        }).then(onfulfiled, onrejected)
      }
    };
  }

  async *test() {
    const listing = new ItemLists<ServiceURL, Models.ListContainersSegmentResponse, IServiceListContainersSegmentOptions, Models.ContainerItem>(
      (container, aborter, _delimiter, marker, options) => container.listContainersSegment(aborter, marker, options),
      (segment: Models.ListContainersSegmentResponse) => segment.containerItems
    );

    for await (const c of listing.listAll(this, Aborter.none, "")) {
      yield c;
    }
  }
}
