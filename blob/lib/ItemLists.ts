import { Aborter } from "./Aborter";
export class ItemLists<TContainer, TSegmentResponse, TServiceListSegmentOptions, TItem> {
  /**
   * Creates an instance of ItemLists.
   * @param {((aborter: Aborter, marker: string | undefined, options?: TServiceListSegmentOptions | {}) => Promise<TSegmentResponse>)} segmentsFunc async method to retrieve a segment of items contained in {@link TSegmentResponse}.
   * @param {((segment: TSegmentResponse) => IterableIterator<TItem> | TItem[])} itemsFunc method to retrive the items from a {@link TSegmentResponse} object
   * @memberof ItemLists
   */
  constructor(
    private readonly segmentsFunc: (container: TContainer, aborter: Aborter, marker: string | undefined, options?: TServiceListSegmentOptions | {}) => Promise<TSegmentResponse>,
    private readonly itemsFunc: (segment: TSegmentResponse) => IterableIterator<TItem> | TItem[]) {
  }

  /**
   *
   * Retrives a sequence of TSegmentResponse asynchonously.
   * @param {Aborter} aborter
   * @param {(TServiceListSegmentOptions | {})} [options={}]
   * @returns {AsyncIterableIterator<TSegmentResponse>}
   * @memberof ItemLists
   */
  async *listSegments(container: TContainer, aborter: Aborter, options: TServiceListSegmentOptions | {} = {}): AsyncIterableIterator<TSegmentResponse> {
    let marker: string | undefined;
    do {
      // TODO: do we need to handle aborter signal?
      yield await this.segmentsFunc(container, aborter, marker, options);
    } while (marker);
  }

  /**
   * Retrieves a sequence of all the TItems.
   *
   * @param {Aborter} aborter
   * @param {(TServiceListSegmentOptions | {})} [options={}]
   * @returns {AsyncIterableIterator<TItem>}
   * @memberof ItemLists
   */
  async *listItems(container: TContainer, aborter: Aborter, options: TServiceListSegmentOptions | {} = {}): AsyncIterableIterator<TItem> {
    for await (const segment of this.listSegments(container, aborter, options)) {
      // TODO: do we need to handle aborter signal?
      yield* this.itemsFunc(segment);
    }
  }

  /**
   * Returns an object that supports iterating all TItems, iterating TSegments, and returning all TItems.
   *
   * @param {Aborter} aborter
   * @param {(TServiceListSegmentOptions | {})} [options={}]
   * @returns
   * @memberof ItemLists
   */
  public listAll(container: TContainer, aborter: Aborter, options: TServiceListSegmentOptions | {} = {}) {
    const that = this;
    return {
      [Symbol.asyncIterator]: () => that.listItems(container, aborter, options),
      Segments: () => that.listSegments(container, aborter, options),
      then(onfulfiled?: ((value: TItem[]) => TItem[] | PromiseLike<TItem[]>) | undefined | null, onrejected?: ((reason: any) => never | PromiseLike<never>) | undefined | null) {
        let all: TItem[] = [];
        return new Promise<TItem[]>(async (resolve) => {
          for await (const segment of this.Segments()) {
            for (const item of that.itemsFunc(segment))
              all = all.concat(item);
          }
          resolve(all);
        }).then(onfulfiled, onrejected);
      }
    };
  }
}
