import { URLBuilder } from "@azure/ms-rest-js";
import * as assert from "assert";

import { RestError, StorageURL } from "../lib";
import { Aborter } from "../lib/Aborter";
import { ContainerURL } from "../lib/ContainerURL";
import { Pipeline } from "../lib/Pipeline";
import { getBSU, getUniqueName } from "./utils";
import { InjectorPolicyFactory } from "./utils/InjectorPolicyFactory";

describe("RetryPolicy", () => {
  const serviceURL = getBSU();
  let containerName: string = getUniqueName("container");
  let containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);

  beforeEach(async () => {
    containerName = getUniqueName("container");
    containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);
    await containerURL.create(Aborter.none);
  });

  afterEach(async () => {
    await containerURL.delete(Aborter.none);
  });

  it("Retry Policy should work when first request fails with 500", async () => {
    let injectCounter = 0;
    const injector = new InjectorPolicyFactory(() => {
      if (injectCounter === 0) {
        injectCounter++;
        return new RestError(
          "Server Internal Error",
          "ServerInternalError",
          500
        );
      }
    });
    let factories = containerURL.pipeline.requestPolicyFactories || [];
    assert.ok(factories.length > 1, "Pipeline factories should not be empty");
    factories = factories.slice();
    factories.push(injector);
    const pipeline: Pipeline = {
      requestPolicyFactories: factories
    };
    const injectContainerURL = containerURL.withPipeline(pipeline);

    const metadata = {
      key0: "val0",
      keya: "vala",
      keyb: "valb"
    };
    await injectContainerURL.setMetadata(Aborter.none, metadata);

    const result = await containerURL.getProperties(Aborter.none);
    assert.deepEqual(result.metadata, metadata);
  });

  it("Retry Policy should failed when requests always fail with 500", async () => {
    const injector = new InjectorPolicyFactory(() => {
      return new RestError("Server Internal Error", "ServerInternalError", 500);
    });

    let factories = containerURL.pipeline.requestPolicyFactories || [];
    assert.ok(factories.length > 1, "Pipeline factories should not be empty");
    const credential = factories[factories.length - 1];
    factories = StorageURL.newPipeline(credential, {
      retryOptions: { maxTries: 3 }
    }).requestPolicyFactories || [];
    assert.ok(factories.length > 1, "The new Pipeline factories should not be empty");
    factories.push(injector);
    const options: Pipeline = {
      requestPolicyFactories: factories
    };
    const injectContainerURL = containerURL.withPipeline(options);

    let hasError = false;
    try {
      const metadata = {
        key0: "val0",
        keya: "vala",
        keyb: "valb"
      };
      await injectContainerURL.setMetadata(Aborter.none, metadata);
    } catch (err) {
      hasError = true;
    }
    assert.ok(hasError);
  });

  it("Retry Policy should work for secondary endpoint", async () => {
    let injectCounter = 0;
    const injector = new InjectorPolicyFactory(() => {
      if (injectCounter++ < 1) {
        return new RestError(
          "Server Internal Error",
          "ServerInternalError",
          500
        );
      }
    });

    const url = serviceURL.url;
    const urlParsed = URLBuilder.parse(url);
    const host = urlParsed.getHost()!;
    const hostParts = host.split(".");
    const account = hostParts.shift();
    const secondaryAccount = `${account}-secondary`;
    hostParts.unshift(secondaryAccount);
    const secondaryHost = hostParts.join(".");

    let factories = containerURL.pipeline.requestPolicyFactories || [];
    assert.ok(factories.length > 1, "Pipeline factories should not be empty");
    const credential = factories[factories.length - 1];
    factories = StorageURL.newPipeline(credential, {
      retryOptions: { maxTries: 2, secondaryHost }
    }).requestPolicyFactories || [];
    assert.ok(factories.length > 1, "The new Pipeline factories should not be empty");
    factories.push(injector);
    const options: Pipeline = {
      requestPolicyFactories: factories
    }
    const injectContainerURL = containerURL.withPipeline(options);

    let finalRequestURL = "";
    try {
      const response = await injectContainerURL.getProperties(Aborter.none);
      finalRequestURL = response._response.request.url;
    } catch (err) {
      finalRequestURL = err.request ? err.request.url : "";
    }

    assert.deepStrictEqual(
      URLBuilder.parse(finalRequestURL).getHost(),
      secondaryHost
    );
  });
});
