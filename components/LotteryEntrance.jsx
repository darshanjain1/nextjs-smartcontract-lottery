import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { useNotification } from "web3uikit";

// Have a function to enter lottery
export default function LotteryEntrance() {
  const { isWeb3Enabled, chainId: chainIdHex } = useMoralis();
  const dispatch = useNotification();
  const chainId = parseInt(chainIdHex);
  const contractAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;
  const [entranceFee, setEntranceFee] = useState("0");
  const [numberOfPlayers, setNumberOfPlayers] = useState("0");
  const [recentWinner, setRecentWinner] = useState("");
  const [lotteryBalance, setlotteryBalance] = useState("0");

  const {
    runContractFunction: enterLottery,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi,
    contractAddress,
    functionName: "enterLottery",
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "i_entranceFee",
    params: {},
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi,
    contractAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  });
  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi,
    contractAddress,
    functionName: "getRecentWinner",
    params: {},
  });
  const { runContractFunction: getLotteryBalance } = useWeb3Contract({
    abi,
    contractAddress,
    functionName: "getBalance",
    params: {},
  });

  async function updateUI() {
    if (isWeb3Enabled && contractAddress) {
      const entranceFees = (await getEntranceFee()).toString();
      setEntranceFee(entranceFees);
      const numberOfPlayers = (await getNumberOfPlayers()).toString();
      setNumberOfPlayers(numberOfPlayers);
      const recentWinner = await getRecentWinner();
      setRecentWinner(recentWinner);
      const lotteryBalance = ethers.formatEther(
        (await getLotteryBalance()).toString()
      );
      setlotteryBalance(lotteryBalance);
    }
  }

  useEffect(() => {
    updateUI();
  }, [isWeb3Enabled]);

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    handleNewNotification();
  };
  const handleNewNotification = () => {
    dispatch({
      type: "info",
      message: "Transaction Completed",
      title: "Tx notification",
      position: "topR",
      icon: "bell",
    });
  };

  const handleLotteryEnter = async () => {
    await enterLottery({
      onSuccess: handleSuccess,
      onError: (error) => console.log("error :>> ", error.data),
    });
  };

  return (
    <>
      {contractAddress ? (
        <div className="p-5">
          <h1>Contract Balance is {lotteryBalance}</h1>
          <h1>Lottery Entrance Fee: {ethers.formatEther(entranceFee)}ETH</h1>
          <h1>Number of existing players in lottery {numberOfPlayers}</h1>
          <h1>Recent winnner of lottery is {recentWinner}</h1>
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
            onClick={handleLotteryEnter}
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div> : <div>Enter Lottery</div>}
          </button>
        </div>
      ) : (
        <div>No contract Found at this network</div>
      )}
    </>
  );
}
