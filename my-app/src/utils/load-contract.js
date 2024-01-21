import contract from "@truffle/contract";

// This file is to communicate our contract and reactjs.

export const loadContract = async (name, provider) => {
  const res = await fetch(`/contracts/${name}.json`);
  const Artifact = await res.json(); // artifacts in ABI of contract
  const _contract = contract(Artifact); // creates an instance of that contract
  _contract.setProvider(provider); //This line sets the provider for the contract object. The provider is the network connection that the contract will be deployed to.
  const deployedContract = await _contract.deployed(); // this line deploys contract to network and deployedContract is instance of deployed contract.
  return deployedContract; // returns the deployed contract.
};

export default loadContract;
