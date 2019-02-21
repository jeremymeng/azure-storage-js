import { deserializationPolicy, RequestPolicyFactory, URLBuilder } from "@azure/ms-rest-js";
import * as assert from "assert";

import { RestError, TelemetryPolicyFactory, UniqueRequestIDPolicyFactory, BrowserPolicyFactory, RetryPolicyFactory, LoggingPolicyFactory } from "../lib";
import { Aborter } from "../lib/Aborter";
import { ContainerURL } from "../lib/ContainerURL";
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
    const factories = containerURL.pipeline.factories.slice(); // clone factories array
    factories.push(injector);
    const injectContainerURL = containerURL.withPipeline(factories);

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

    const credential =
      containerURL.pipeline.factories[
        containerURL.pipeline.factories.length - 1
      ];
    const factories: RequestPolicyFactory[] = [
      new TelemetryPolicyFactory(undefined),
      new UniqueRequestIDPolicyFactory(),
      new BrowserPolicyFactory(),
      deserializationPolicy(), // Default deserializationPolicy is provided by protocol layer
      new RetryPolicyFactory({ maxTries: 3 }),
      new LoggingPolicyFactory(),
      credential
    ];

    factories.push(injector);
    const injectContainerURL = containerURL.withPipeline(factories);

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

    const credential =
      containerURL.pipeline.factories[
        containerURL.pipeline.factories.length - 1
      ];

    const factories: RequestPolicyFactory[] = [
      new TelemetryPolicyFactory(undefined),
      new UniqueRequestIDPolicyFactory(),
      new BrowserPolicyFactory(),
      deserializationPolicy(), // Default deserializationPolicy is provided by protocol layer
      new RetryPolicyFactory({ maxTries: 2, secondaryHost }),
      new LoggingPolicyFactory(),
      credential
    ];

    factories.push(injector);

    const injectContainerURL = containerURL.withPipeline(factories);

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
