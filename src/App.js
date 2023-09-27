import React, { useState, useEffect } from "react";
import lottery from "./contracts/lottery";
import etherProvider from "./helpers/provider";
import { ethers } from "ethers";

function App() {
  const [lotteryInfo, setLotteryInfo] = useState({
    manager: "",
    players: [],
    balance: 0,
  });
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      const manager = await lottery.manager();
      const players = await lottery.playersList();
      const balance = await etherProvider.getBalance(lottery.address);
      setLotteryInfo({
        manager,
        players,
        balance,
      });
    }
    fetchData();
  }, []);

  const reloader = () => {
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const entryLottery = async () => {
    try {
      const accounts = await etherProvider.listAccounts();
      const signer = etherProvider.getSigner(accounts[0]);

      if (accounts.length === 0) {
        setMessage("Login into Metamask to continue");
        return;
      }

      setMessage("Waiting on transaction success...");

      const contractWithSigner = lottery.connect(signer);

      // Send the transaction using the contract with the signer
      const tx = await contractWithSigner.enterLottery({
        value: ethers.utils.parseEther(value),
        gasLimit: 1000000,
      });

      await tx.wait();
      setMessage("You have been entered!");

      reloader();
    } catch (err) {
      console.log(err);
      setMessage("Something went wrong!");
      reloader();
    }
  };

  const pickWinner = async () => {
    try {
      const accounts = await etherProvider.listAccounts();
      const signer = etherProvider.getSigner(accounts[0]);

      if (accounts.length === 0) {
        setMessage("Login into Metamask to continue");
        return;
      }

      if (accounts[0] === lotteryInfo.manager) {
        setMessage("Waiting on transaction success...");

        const contractWithSigner = lottery.connect(signer);

        const winner = await contractWithSigner.pickWinner({
          from: accounts[0],
          gasLimit: 1000000,
        });

        console.log(winner);
        setMessage(
          `A winner has been picked. Here is your receipt ${winner.hash}`
        );
      } else {
        setMessage("Only manager can pick the winner!");
        return;
      }
    } catch (err) {
      console.log(err);
      setMessage("Something went wrong!");
      reloader();
    }
  };

  return (
    <div>
      <h2>Lottery Contract</h2>
      <p>
        This contract is managed by <b> {lotteryInfo.manager} </b>. There are
        currently
        <b> {lotteryInfo.players.length} </b> people entered, competing to win
        <b> {ethers.utils.formatEther(lotteryInfo.balance)} </b>
        ether!
      </p>
      <hr />
      <div>
        <h4>Want to try your luck?</h4>
        <div>
          <label>Amount of ether to enter</label>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>
        <button onClick={entryLottery}>Enter</button>
      </div>
      <hr />
      <h4>Ready to pick a winner?</h4>
      <button onClick={pickWinner}>Pick a winner!</button>
      <hr />
      <h3>{message}</h3>
    </div>
  );
}

export default App;
