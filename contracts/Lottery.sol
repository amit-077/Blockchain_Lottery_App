//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

contract Lottery{
    address public owner;
    address payable[] public participants ;
    uint counter = 1;
    constructor(){
        owner = msg.sender;
    }

    mapping(address=>bool) public registeredContestants;

    function getLotteryTicket() public payable{
        require(msg.value >= 1 ether, "Please pay 1 ether");
        if(msg.value > 1 ether){
            payable(msg.sender).transfer(msg.value - 1 ether);
        }
        if(!registeredContestants[msg.sender]){
        participants.push(payable(msg.sender));
        registeredContestants[msg.sender] = true;
        }
    }

    function getContractBalance() public view returns(uint){
        return address(this).balance;
    }

    function getParticpants() public view returns(address payable[] memory){
        return participants;
    }

    function chooseWinner() public returns(address payable){
        require(msg.sender == owner, "You are not the contract owner");
        require(participants.length >=3, "Not enough participants to declare result");
        uint winnerNum = uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, participants,counter))) % participants.length;
        address payable winner = participants[winnerNum];
        winner.transfer(address(this).balance);

        // clear mapping.
        for(uint i=0; i<participants.length; i++){
            registeredContestants[participants[i]] = false;
        }
        //clear array. 
        delete participants;
        return winner;
    }
}