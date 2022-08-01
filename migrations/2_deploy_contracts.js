const Decentragram = artifacts.require("Decentragram");

module.exports = function(deployer) {
  // Code goes here...
  // puts smart contracts inside of blockchain. migrate smart contracts from our computer to the blockchain in the system. 
  // important to create this migration. 
  deployer.deploy(Decentragram);
  // then run truffle migrate --reset, reset is for previous smart contracts to be taken off of the history. 


  // then truffle console to get into truffles blockchain 
  // then decentragram = await  Decentragram.deployed()
  // this is to get information from the decentragram value. This will give us json of the smart contract we are applying for 
  // decentragram.address gives us the address.  

  // name = await deccentragram.name(), this is used in JS
  // we can also use the console to get individual json elements from the decentragram smart contract. 
};