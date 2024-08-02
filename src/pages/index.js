import React, { useEffect, useState, useCallback } from "react";
import { useConnectWallet } from "@web3-onboard/react";
import abi from "../utils/BuyMeACoffee.json";
import { ethers } from "ethers";

export default function Home() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [coffee, setGetCoffee] = useState([]);
  const [coffeeContract, setCoffeeContract] = useState();
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

  const OWNER_ADDRESS = "0x9520E660BeD40D191e1c4A0AF772bf7eE480e90F";
  const CONTRACT_ADDRESS = "0x2e1ec460bfec17a88e17e1aab1216ed802e2a874";

  const CONTRACT_ABI = abi.abi;

  const getCoffee = useCallback(async () => {
    try {
      if (coffeeContract) {
        console.log("getting coffee Id");
        const coffeeId = await coffeeContract.coffeeId();
        console.log(coffeeId.toString());
        const getCoffee = await coffeeContract.getAllCoffee(
          coffeeId.toString()
        );
        setGetCoffee(getCoffee);
      }
    } catch (error) {
      console.log(error);
    }
  }, [coffeeContract]);

  useEffect(() => {
    let ethersProvider;
    if (wallet) {
      ethersProvider = new ethers.BrowserProvider(wallet.provider, "any");
    }

    if (ethersProvider) {
      try {
        const getCoffeContract = async () => {
          const signer = await ethersProvider.getSigner();
          const buyMeACoffee = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
          );
          setCoffeeContract(buyMeACoffee);
        };
        getCoffeContract();
      } catch (error) {
        console.log(error);
      }
    }
  }, [wallet, CONTRACT_ABI]);

  useEffect(() => {
    const onNewCoffee = (from, timestamp, name, message) => {
      console.log("새 커피 트랜잭션: ", from, timestamp, name, message);
      setGetCoffee((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name,
        },
      ]);
    };
    if (wallet && coffeeContract) {
      getCoffee();
      coffeeContract.on("NewCoffee", onNewCoffee);
    } else {
      console.log("provider not initialized yet");
    }
  }, [wallet, coffeeContract, getCoffee]);

  const onNameChange = (event) => {
    setName(event.target.value);
  };
  const onMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const buyCoffee = async (e) => {
    e.preventDefault();
    try {
      if (!wallet && !coffeeContract) {
        console.log("provider가 초기화되지 않았습니다.");
        return;
      }
      console.log("커피 구매 중...");
      const coffeeTxn = await coffeeContract.buyCoffee(name, message, {
        value: ethers.parseEther("1.0"),
      });
      const coffeTx = await coffeeTxn.wait();

      console.log("mined ", coffeTx.hash);
      console.log("커피 전송 완료!");

      const notifyMsg = `새로운 커피가 구매되었습니다.\n${name}님의 메시지: ${message}`;
      sendNotification(notifyMsg);

      e.target.inputName.value = "";
      e.target.inputAmount.value = "";

      setName("");
      setMessage("");
      await getCoffee();
    } catch (error) {
      console.log(error);
    }
  };

  // 디스코드 webhook으로 메시지 전송
  const sendNotification = async(notifyMsg) => {
    const response = await fetch("/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({notifyMsg}),
    });

    const data = await response.json();
    if (data.success) {
      console.log("Notification sent!");
    } else {
      console.log("Failed to send notification");
    }
  };

  const formatBigNumberToKlay = (bigNumber) => {
    const klay = parseFloat(bigNumber.toString()) / 1e18;
    return klay.toFixed(3);
  };

  const withdrawTips = async () => {
    try {
      if (!wallet || !coffeeContract) return;
      const signerAddress = wallet.accounts[0].address;
      if (signerAddress.toLowerCase() !== OWNER_ADDRESS.toLowerCase()) {
        alert("소유자만 사용 가능합니다.");
        return;
      }

      const provider = new ethers.BrowserProvider(wallet.provider);
      const ownerBalanceBefore = await provider.getBalance(OWNER_ADDRESS);
      const contractBalanceBefore = await provider.getBalance(CONTRACT_ADDRESS);

      console.log("인출 전 소유자 잔액:", ownerBalanceBefore.toString());
      console.log("인출 전 계약 잔액:", contractBalanceBefore.toString());

      const withdrawTxn = await coffeeContract.withdrawCoffeTips();
      await withdrawTxn.wait();

      const ownerBalanceAfter = await provider.getBalance(OWNER_ADDRESS);
      const contractBalanceAfter = await provider.getBalance(CONTRACT_ADDRESS);

      console.log("인출 후 소유자 잔액:", ownerBalanceAfter.toString());
      console.log("인출 후 계약 잔액:", contractBalanceAfter.toString());

      alert(`팁이 성공적으로 인출되었습니다.\n
        인출 전 소유자 잔액: ${formatBigNumberToKlay(ownerBalanceBefore)} KLAY\n
        인출 전 계약 잔액: ${formatBigNumberToKlay(
          contractBalanceBefore
        )} KLAY\n
        인출 후 소유자 잔액: ${formatBigNumberToKlay(ownerBalanceAfter)} KLAY`);
    } catch (error) {
      console.log(error);
      alert("인출 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="min-h-screen p-5 bg-black flex flex-col justify-center items-center bg-fixed bg-cover bg-center">
      <nav className="w-full flex justify-end">
        {wallet && (
          <button
            onClick={withdrawTips}
            className="flex justify-end p-2 rounded-2xl bg-white text-black text-sm cursor-pointer font-bold"
          >
            WITHDRAW
          </button>
        )}
      </nav>

      <div className="flex flex-col justify-center items-center w-full pt-10">
        <div className="flex flex-col justify-center items-center text-center">
          <h1 className="text-white text-xl p-5">
            Buy Me A Coffee는
            <br />
            Klaytn Baobab Network
            <br />
            기반에서 동작합니다.
          </h1>

          {wallet ? (
            <div>
              <form
                onSubmit={buyCoffee}
                className="flex flex-col justify-center items-center m-5"
              >
                <input
                  type="text"
                  name="inputName"
                  placeholder="Enter your name"
                  className="p-3 rounded-lg bg-black text-white border-solid border border-white outline-0 w-80"
                  onChange={onNameChange}
                />
                <input
                  type="text"
                  name="inputAmount"
                  placeholder="Send your message"
                  className="p-3 rounded-lg bg-black text-white border-solid border border-white mt-3 outline-0 w-80"
                  onChange={onMessageChange}
                />
                <input
                  type="submit"
                  value="SEND COFFEE"
                  className="p-3 mt-4 rounded-2xl bg-white text-black cursor-pointer font-bold w-80"
                />
              </form>
            </div>
          ) : (
            <button
              className="text-black bg-white p-3 rounded-lg mt-3 cursor-pointer"
              disabled={connecting}
              onClick={() => (wallet ? disconnect(wallet) : connect())}
            >
              {connecting ? "Connecting" : wallet ? "Disconnect" : "Connect"}
            </button>
          )}
        </div>
        <div className="flex flex-col justify-center items-center py-3 px-1 w-full">
          {wallet && (
            <div className="flex m-5">
              <h1 className="text-white text-2xl">Coffee Transaction</h1>
            </div>
          )}
          <div className="flex flex-col gap-5 w-full max-w-md mb-10">
            {wallet &&
              coffee.map((coff, id) => (
                <div
                  key={id}
                  className="border-solid border border-white p-5 w-auto rounded-2xl mb-3 bg-white bg-opacity-20"
                >
                  <p className="text-white font-bold">{coff.message}</p>
                  <p className="text-white">
                    From: {coff.name} at{" "}
                    {`${new Date(
                      coff.timestamp.toString() * 1000
                    ).toLocaleString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}`}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
