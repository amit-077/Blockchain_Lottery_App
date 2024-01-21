var Lottery = artifacts.require("Lottery");

module.exports = function (deployer) {
  // deployment steps
  deployer.deploy(Lottery);
};
  