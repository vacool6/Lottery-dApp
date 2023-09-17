import React, { useState, useEffect } from "react";
import web3 from "./helpers/web3";
import lottery from "./contracts/lottery";

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
      const manager = await lottery.methods.manager().call();
      const players = await lottery.methods.playersList().call();
      const balance = await web3.eth.getBalance(lottery.options.address);
      setLotteryInfo({
        manager,
        players,
        balance,
      });
    }
    fetchData();
  }, []);

  const entryLottery = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      setMessage("Waiting on transaction success...");
      await lottery.methods.enterLottery().send({
        from: accounts[0],
        value: web3.utils.toWei(value, "ether"),
      });
      setMessage("You have been entered!");
    } catch (err) {
      console.log(err);
      setMessage("Something went wrong!");
    }
  };

  const pickWinner = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts[0] === lotteryInfo.manager) {
        setMessage("Waiting on transaction success...");
        await lottery.methods.pickWinner().send({
          from: accounts[0],
        });
        setMessage("A winner has been picked!");
      } else {
        setMessage("Only manager can pick the winner!");
        return;
      }
    } catch (err) {
      console.log(err);
      setMessage("Something went wrong!");
    }
  };

  return (
    <div>
      <h2>Lottery Contract</h2>
      <p>
        This contract is managed by {lotteryInfo.manager}. There are currently{" "}
        {lotteryInfo.players.length} people entered, competing to win{" "}
        {web3.utils.fromWei(lotteryInfo.balance, "ether")} ether!
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

      <h1>{message}</h1>
    </div>
  );
}

export default App;
