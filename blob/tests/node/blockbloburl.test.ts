import * as assert from "assert";

import { Aborter } from "../../lib/Aborter";
import { bodyToString, getBSU, getUniqueName } from "../utils";

describe("BlockBlobURL Node.js only", () => {
  const serviceURL = getBSU();
  let containerName: string = getUniqueName("container");
  let containerURL = serviceURL.createContainerURL(containerName);
  let blobName: string = getUniqueName("blob");
  let blockBlobURL = containerURL.createBlockBlobURL(blobName);

  beforeEach(async () => {
    containerName = getUniqueName("container");
    containerURL = serviceURL.createContainerURL(containerName);
    await containerURL.create(Aborter.none);
    blobName = getUniqueName("blob");
    blockBlobURL = containerURL.createBlockBlobURL(blobName);
  });

  afterEach(async () => {
    await containerURL.delete(Aborter.none);
  });

  it("upload with Readable stream body and default parameters", async () => {
    const body: string = getUniqueName("randomstring");
    const bodyBuffer = Buffer.from(body);

    await blockBlobURL.upload(Aborter.none, bodyBuffer, body.length);
    const result = await blockBlobURL.download(Aborter.none, 0);

    const downloadedBody = await new Promise((resolve, reject) => {
      const buffer: string[] = [];
      result.readableStreamBody!.on("data", (data: Buffer) => {
        buffer.push(data.toString());
      });
      result.readableStreamBody!.on("end", () => {
        resolve(buffer.join(""));
      });
      result.readableStreamBody!.on("error", reject);
    });

    assert.deepStrictEqual(downloadedBody, body);
  });

  it("upload with Chinese string body and default parameters", async () => {
    const body: string = getUniqueName("randomstring你好");
    await blockBlobURL.upload(Aborter.none, body, Buffer.byteLength(body));
    const result = await blockBlobURL.download(Aborter.none, 0);
    assert.deepStrictEqual(
      await bodyToString(result, Buffer.byteLength(body)),
      body
    );
  });
});
