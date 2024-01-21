import React, { useEffect, useState } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import loadContract from "../utils/load-contract";
import Web3 from "web3";

const App = () => {
  const [connectedAccount, setConnectedAccount] = useState("");
  const [lotteryBalance, setLotteryBalance] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null,
  });

  function setAccountListener(provider) {
    provider.on("accountsChanged", (accounts) => {
      setConnectedAccount(accounts[0]);
    });
  }

  function refreshPage() {
    setRefresh(!refresh);
  }

  useEffect(() => {
    async function detectProvider() {
      const provider = await detectEthereumProvider();
      const contract = await loadContract("Lottery", provider);
      if (provider) {
        provider.request({ method: "eth_requestAccounts" });
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract,
        });
      } else {
        console.log("Metamask not detected");
      }
    }

    detectProvider();
  }, []);

  useEffect(() => {
    let { provider, web3, contract } = web3Api;

    async function getAccount() {
      let account = await web3.eth.getAccounts();
      console.log(account);
      setAccountListener(provider);
      setConnectedAccount(account[0]);
      let balance = await web3.eth.getBalance(account[0]);
      balance =
        Math.round((await web3.utils.fromWei(balance, "ether")) * 100) / 100;
      setUserBalance(balance);
    }

    web3Api.contract && getAccount();
  }, [web3Api, refresh]);

  useEffect(() => {
    let { contract } = web3Api;
    async function getContestants() {
      let contestants = await contract.getParticpants({
        from: connectedAccount,
      });

      setParticipants(contestants);
    }

    web3Api.contract && getContestants();
  }, [web3Api.contract, refresh]);

  useEffect(() => {
    let { web3, contract } = web3Api;
    async function getTotalBalance() {
      let amount = await contract.getContractBalance({
        from: connectedAccount,
      });

      amount = await web3.utils.fromWei(amount.toString(), "ether");
      setLotteryBalance(amount);
    }

    web3Api.contract && getTotalBalance();
  }, [web3Api.contract, refresh]);

  async function purchaseLottery() {
    let { web3, contract } = web3Api;
    await contract.getLotteryTicket({
      from: connectedAccount,
      value: await web3.utils.toWei("1", "ether"),
    });
    refreshPage();
  }

  async function selectWinner() {
    let { web3, contract } = web3Api;
    let winner = await contract.chooseWinner({
      from: connectedAccount,
    });

    refreshPage();
    console.log(winner);
  }

  return (
    <>
      <div className="navbar">
        <div className="navHeading">Lottery DApp</div>
        <div className="navItemsDiv">
          <li className="navItem">
            Connected Account :{" "}
            {connectedAccount ? connectedAccount : "Not Connected"}
          </li>
          <li className="navItem">
            Account Balance : {userBalance ? userBalance : 0}
          </li>
        </div>
      </div>

      <div className="lotteryMainDiv">
        <div className="lotteryDiv">
          To participate in the lottery, you need to pay 1 ether.
        </div>
        <div className="payBtnDiv">
          <div>
            <button className="payBtn getLottery" onClick={purchaseLottery}>
              Click here to pay 1 ether
            </button>
          </div>
          <div>
            <button className="payBtn winnerBtn" onClick={selectWinner}>
              Declare Winner
            </button>
          </div>
        </div>
        <div className="lotteryAmount">
          Lottery Amount : {lotteryBalance ? lotteryBalance : 0} ETH
        </div>
        <div className="participantsDiv">
          <span className="participantsTitle">Participants : </span>
          {participants.map((participant) => {
            return (
              <div className="participants">
                {participant}{" "}
                {participant === connectedAccount ? (
                  <span className="myAddress">(You)</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default App;

// problem :
//Even after paying money, participants array is empty.
// This happens because you didn't cleared mapping.
