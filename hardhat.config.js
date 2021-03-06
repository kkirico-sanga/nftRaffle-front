require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

const {ALCHEMY_API_KEY,PRIVATE_KEY} = process.env;
module.exports = {
  solidity: "0.8.0",
  networks:{
    ropsten: {
      uri:`${ALCHEMY_API_KEY}`,
      accounts: [`0x${PRIVATE_KEY}`], //COntract owner가 된다
    }
  }
};
