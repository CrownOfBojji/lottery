// compile code will go here
// command: node compile.js
const path = require('path');
const fs = require('fs');
const solc = require('solc');


const lotteryPath = path.resolve(__dirname, 'contracts', 'lottery.sol');
const source = fs.readFileSync(lotteryPath, 'utf8');

// define the input in json based on:
// https://docs.soliditylang.org/en/v0.8.7/using-the-compiler.html#compiler-input-and-output-json-description
const input = {
  language: 'Solidity',
  sources: {
    'lottery.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};


// var parsedJson = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
//   'lottery.sol'
// ].Lottery;
//
// console.log(parsedJson);
module.exports = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
  'lottery.sol'
].Lottery;
