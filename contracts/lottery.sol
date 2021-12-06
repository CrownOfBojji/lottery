// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract Lottery {

    constructor()
    {
        manager = msg.sender;
    }

    modifier restricted()
    {
      require(msg.sender == manager);
      _;
    }

    function enterLottery() public payable
    {
      require(msg.value > 0.000001 ether);

      participants.push(payable(msg.sender));
    }

    function pickWinner() public restricted
    {
      uint idx = random() % participants.length;
      participants[idx].transfer(address(this).balance);
      participants = new address payable[](0);
    }

    function showParticipants() public view returns (address payable[] memory)
    {
      return participants;
    }

    function random() private view returns (uint)
    {
      return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, participants)));
    }

    address public manager;
    address payable[] public participants;
}
