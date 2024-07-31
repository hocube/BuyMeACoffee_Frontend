import React, { useEffect, useState, useCallback } from 'react';
// 지갑 연결 상태를 쉽게 관리하고, 지갑을 연결하거나 해제할 수 있다.
import { useConnectWallet } from '@web3-onboard/react' // app.js에서 세팅한 내용들을 사용하기 위해 import
import abi from "../utils/BuyMeACoffee.json"
import { ethers } from "ethers";

export default function Home() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [coffee, setGetCoffee] = useState([]);
  const [coffeeContract, setCoffeeContract] = useState();
  // 소유자 주소를 하드코딩
  const ownerAddress = "0x9520E660BeD40D191e1c4A0AF772bf7eE480e90F";
  // 지갑 연결 상태와 연결/해제 기능을 위한 상태 변수
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const contractAddress = "0x2e1ec460bfec17a88e17e1aab1216ed802e2a874";
  const contractABI = abi.abi;

  // 커피 트랜잭션 가져오기 함수
  // 현재 계약 주소(contractAddress)에 저장된 커피 트랜잭션들을 조회하는 기능
  const getCoffee = useCallback(async () => {
    try {
      if (coffeeContract) {
        console.log("getting coffee Id");
        const coffeeId = await coffeeContract.coffeeId();
        console.log(coffeeId.toString());
        const getCoffee = await coffeeContract.getAllCoffee(coffeeId.toString());
        setGetCoffee(getCoffee);
      }
    } catch (error) {
      console.log(error);
    }
  }, [coffeeContract]);

  // 지갑 연결 시 스마트 계약 설정
  // 지갑이 연결되면 ethers를 사용하여 스마트 계약과 연결.
  // 이 과정을 위해 ethersProvider와 signer를 사용.
  useEffect(() => {
    let ethersProvider
    if (wallet) {
       ethersProvider = new ethers.BrowserProvider(wallet.provider, 'any')
    }
  
    
    if (ethersProvider) {
      try {
        // ethers 라이브러리의 기능을 사용해서 Contract와 연결한다.
        const getCoffeContract = async () => {
          const signer =  await ethersProvider.getSigner();
          // 이 Contract를 연결하려면 contract주소와, ABI와 지갑주인의 signer가 필요하다.
          const buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);
          setCoffeeContract(buyMeACoffee);
        };
        getCoffeContract();
      } catch (error) {
        console.log(error);
      }
    }
  }, [wallet, contractABI])


  // 새 커피 트랜잭션 이벤트 리스너
  // 새로운 커피 트랜잭션이 발생할 때마다 상태를 업데이트
  // 이벤트 리스너를 설정하여 스마트 계약의 NewCoffee 이벤트를 수신
  useEffect(() => {
    const onNewCoffee = (from, timestamp, name, message) => {
      console.log("Coffee received: ", from, timestamp, name, message);
      setGetCoffee((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };
      if (wallet && coffeeContract) {
        getCoffee()
        coffeeContract.on("NewCoffee", onNewCoffee);    
      } else {
        console.log("provider not initialized yet");
      }
  }, [wallet, coffeeContract, getCoffee]);


  // 사용자가 입력 필드에 입력한 값을 상태 변수에 저장
  const onNameChange = (event) => {
    setName(event.target.value);
  }
  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }


  // 커피 구매 함수
  // 사용자가 커피를 구매할 때 스마트 계약의 buyCoffee 함수를 호출.
  // 트랜잭션이 완료되면 입력 필드를 초기화하고 최신 커피 트랜잭션을 가져온다.
  const buyCoffee = async (e) => {
    e.preventDefault();
    try {
      if (!wallet && !coffeeContract) {
        console.log("provider not initialized yet");
        return;
      }
        console.log("buying coffee..")
        const coffeeTxn = await coffeeContract.buyCoffee(name, message, {value: ethers.parseEther("1.0")});
        const coffeTx =  await coffeeTxn.wait();
        
        console.log("mined ", coffeTx.hash);
        console.log("coffee sent!");
        
        e.target.inputName.value = "";
        e.target.inputAmount.value = "";

        setName("");
        setMessage("");
        await getCoffee();
    } catch (error) {
      console.log(error);
    }
  };

  // 팁 인출 함수
  const withdrawTips = async () => {
    try {
      if (!wallet && !coffeeContract) return;
      const signerAddress = await wallet.accounts[0].address;
      if (signerAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
        alert("소유자만 사용 가능합니다");
        return;
      }
      // 인출 전 잔액 가져오기
      const provider = new ethers.BrowserProvider(wallet.provider);
      const ownerBalanceBefore = await provider.getBalance(ownerAddress);
      const contractBalanceBefore = await provider.getBalance(contractAddress);

      // 잔액이 제대로 조회되는지 확인
      console.log('Owner balance before:', ownerBalanceBefore);
      console.log('Contract balance before:', contractBalanceBefore);

      // 팁 인출 트랜잭션
      const withdrawTxn = await coffeeContract.withdrawCoffeTips();
      await withdrawTxn.wait();

      // 인출 후 잔액 가져오기
      const ownerBalanceAfter = await provider.getBalance(ownerAddress);
      const contractBalanceAfter = await provider.getBalance(contractAddress);

      // 잔액이 제대로 조회되는지 확인
      console.log('Owner balance after:', ownerBalanceAfter);
      console.log('Contract balance after:', contractBalanceAfter);

      // 알림창에 잔액 표시
      alert(`팁이 성공적으로 인출되었습니다.\n
        인출 전 소유자 잔액: ${ethers.formatEther(ownerBalanceBefore)} KLAY\n
        인출 전 계약 잔액: ${ethers.formatEther(contractBalanceBefore)} KLAY\n
        인출 후 소유자 잔액: ${ethers.formatEther(ownerBalanceAfter)} KLAY`);
      
      }catch (error) {
      console.log(error);
      alert("인출 중 오류가 발생했습니다");
    }
  };

  return (
     <main className='coffeeMain max-w-8xl min-h-[100vh] p-10 bg-black mt-0 shadow-2xl m-auto flex flex-col justify-center items-center bg-[url("https://static.vecteezy.com/system/resources/previews/001/330/185/original/coffee-cup-on-hand-drawn-doodle-background-free-vector.jpg")]'>
        {wallet && (
          <button 
            onClick={withdrawTips} 
            className='fixed top-4 right-4 p-3 rounded-2xl bg-white text-black cursor-pointer font-bold'>
            WITHDRAW
          </button>
  )}
        <div className='coffeContent'>
          <div className='compOne flex flex-col justify-center items-center'>
            <h1 className='text-white text-center text-2xl'>Buy Me A Cofee는 Klaytn Baobab Network 기반에서 동작합니다.</h1>
        
            { wallet ?
            ( <div>
                <form onSubmit={buyCoffee} className="flex flex-col justify-center items-center mt-4">
                  <input type="text" name='inputName' placeholder="Enter your name" className="p-5 rounded-md bg-black text-white border-solid border-2 border-white outline-0" onChange={onNameChange} />
                  <input type="text" name='inputAmount' placeholder="Send your message" className="p-5 rounded-md bg-black text-white border-solid border-2 border-white mt-3 outline-0" onChange={onMessageChange}/>
                  <input type="submit" value="SEND COFFEE" className="p-3 mt-4 rounded-2xl bg-white text-black cursor-pointer font-bold"/>
                </form>
            </div> ) : ( <button className='text-black bg-white p-3 rounded-lg mt-3 cursor-pointer' disabled={connecting} onClick={() => (wallet ? disconnect(wallet) : connect())}>
        {connecting ? 'Connecting' : wallet ? 'Disconnect' : 'Connect'}
      </button>)
        
            }
          </div>
          <div className="comp2 flex flex-col justify-normal items-center py-3 px-10">
            {wallet && ( 
              <div className="flex mt-5 mb-3">
                  <h1 className="text-white text-2xl">Coffee Transaction</h1>
              </div>
              ) }
              <div className="coffeeTransaction w-[500px] flex flex-col gap-5">
              {/* grid gap-4 grid-cols-2 */}
                {wallet && (coffee.map((coff, id) => {
                      return (
                        <div key={id} className=" border-solid border-2 border-white p-5 w-auto rounded-2xl mb-3">
                          <p className=" text-white font-bold">{coff.message}</p>
                          <p className=" text-white">From: {coff.name} at {`${new Date(coff.timestamp.toString() * 1000)}`}</p>
                        </div>
                      )
                }))}
              </div>
            </div>
        </div>
    </main>
  );
}