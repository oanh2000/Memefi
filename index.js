const settings = require("./bot/config/config");
const proxies = require("./bot/config/proxies");
const NonSessionTapper = require("./bot/core/nonSessionTapper");
const banner = require("./bot/utils/banner");
const logger = require("./bot/utils/logger");
const luncher = require("./bot/utils/luncher");
const path = require("path");
const sleep = require("./bot/utils/sleep");

const main = async () => {
  const nodeVersion = process.version;
  const major = process.versions
    ? parseInt(nodeVersion.split(".")[0].replace("v", ""), 10)
    : 0;
  if (major < 18 || major > 20 || isNaN(major) || major === 0) {
    return logger.error(
      "To run this bot, Node.js version <la>18.x</la> or <lb>20.x</lb> is required.\n Current version: <bl>" +
        nodeVersion +
        "</bl>"
    );
  }
  if (settings.USE_QUERY_ID === false) {
    await luncher.process();
  } else {
    console.log(banner);
    const getProxies = settings.USE_PROXY_FROM_FILE ? proxies : null;
    let proxiesCycle = getProxies ? getProxies[Symbol.iterator]() : null;
    const query_ids = require(path.join(process.cwd(), "queryIds.json"));
    const queries = Object.entries(query_ids);
    const tasks = queries?.map(async ([query_name, query_id], index) => {
      const proxy = proxiesCycle ? proxiesCycle.next().value : null;
      try {
        const sleeping = sleep.generateDelays(queries.length + 1)[index];
        logger.info(
          `<ye>[memefi]</ye> | ${query_name} | Sleeping ${sleeping} seconds before starting the bot`
        );
        await sleep(sleeping);
        new NonSessionTapper(query_id, query_name).run(proxy);
      } catch (error) {
        logger.error(`Error in task for tg_client: ${error.message}`);
      }
    });

    await Promise.all(tasks);
  }
};

// Wrap main function execution in an async context to handle asynchronous operations
(async () => {
  try {
    await main();
  } catch (error) {
    throw error;
  }
})();
