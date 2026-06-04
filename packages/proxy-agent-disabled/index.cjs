"use strict";

class DisabledProxyAgent {
  constructor() {
    throw new Error(
      "proxy-agent is disabled in this application. Unset URLLIB_ENABLE_PROXY and URLLIB_PROXY for Aliyun OSS direct mode.",
    );
  }
}

module.exports = DisabledProxyAgent;
module.exports.ProxyAgent = DisabledProxyAgent;
