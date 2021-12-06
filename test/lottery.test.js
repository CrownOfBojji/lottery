const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { abi, evm } = require('../compile');

let accounts;
let lottery;

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(abi)
    .deploy({
      data: evm.bytecode.object
    })
    .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery', () => {
  it('deploys a contract', () => {
    assert.ok(lottery.options.address);
  });

  it('allow player to enter', async () => {
    await lottery.methods.enterLottery().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.showParticipants().call();

    assert.equal(1, players.length);
    assert.equal(accounts[0], players[0]);
  });

  it('allow multiple players to enter', async () => {
    await lottery.methods.enterLottery().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });

    await lottery.methods.enterLottery().send({
      from: accounts[1],
      value: web3.utils.toWei('0.5', 'ether')
    });

    await lottery.methods.enterLottery().send({
      from: accounts[2],
      value: web3.utils.toWei('0.02', 'ether')
    });


    const players = await lottery.methods.showParticipants().call();

    assert.equal(3, players.length);
    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
  });

  it('requires minimal ether to enter', async () => {
    try{
      await lottery.methods.enterLottery().send({
        from: accounts[0],
        value: web3.utils.toWei('0.00001', 'ether')
      });
      assert(false);
    } catch(err)
    {
        assert(err);
    }
  });

  it('only manager can call pick winner', async () => {
    try{
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      });
      assert(false);
    } catch(err)
    {
        assert(err);
    }
  });

  it('can pick winner', async () => {
    await lottery.methods.enterLottery().send({
      from: accounts[0],
      value: web3.utils.toWei('1', 'ether')
    });

    await lottery.methods.enterLottery().send({
      from: accounts[1],
      value: web3.utils.toWei('1', 'ether')
    });

    const initBalanceOne = await web3.eth.getBalance(accounts[0]);
    const initBalanceTwo = await web3.eth.getBalance(accounts[1]);

    const initContractBalance = await web3.eth.getBalance(lottery.options.address)
    assert(initContractBalance > web3.utils.toWei('1.9', 'ether'));

    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    const afterContractBalance = await web3.eth.getBalance(lottery.options.address)
    assert.equal(0, afterContractBalance);

    const afterBalanceOne = await web3.eth.getBalance(accounts[0]);
    const afterBalanceTwo = await web3.eth.getBalance(accounts[1]);

    const diffOne = Math.abs(afterBalanceOne - initBalanceOne);
    const diffTwo = Math.abs(afterBalanceTwo - initBalanceTwo);

    if(diffOne < web3.utils.toWei('1', 'ether'))
    {
      assert(diffTwo > web3.utils.toWei('1.8', 'ether'));
    }
    else
    {
      assert(diffOne > web3.utils.toWei('1.8', 'ether'));
    }

    const players = await lottery.methods.showParticipants().call();

    assert.equal(0, players.length);
  });
});
