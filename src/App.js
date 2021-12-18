import React, { useContext, useEffect } from 'react';

import web3 from './connection/web3';
import Navbar from './components/Layout/Navbar';
import Main from './components/Content/Main';
import Web3Context from './store/web3-context';
// import CollectionContext from './store/collection-context';
// import MarketplaceContext from './store/marketplace-context'
import NFTCollection from './abis/NFTCollection.json';
import NFTMarketplace from './abis/NFTMarketplace.json';
//import './cover.css';
import FundingContext from './store/funding-context';
import MyNFTContext from './store/myNFT-context'

//ABI 두개 추가
// address 
import MyNFT from './abis/MyNFT.json';
import Funding from './abis/Funding.json';

import { nftAddress,fundingAddress } from './constants/address';
import MyVerticallyCenteredModal from './components/Content/NFTCollection/Modal';

const App = () => {
  const web3Ctx = useContext(Web3Context);
  //내가 만든 Contract 추가 
  const myNFTCtx = useContext(MyNFTContext);
  const fundingCtx = useContext(FundingContext);
  useEffect(() => {
    // Check if the user has Metamask active
    if(!web3) {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
      return;
    }
    
    // Function to fetch all the blockchain data
    const loadBlockchainData = async() => {
      // Request accounts acccess if needed
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });  
      } catch(error) {
        console.error(error);
      }
      
      // Load account
      const account = await web3Ctx.loadAccount(web3);
      // Load Network ID
      const networkId = await web3Ctx.loadNetworkId(web3);

      //내가 만든 contract 추가
      // const mynftDeployedNetwork = nftAddress;
      //console.log('network ID: ',networkId);

      const fundingContract = fundingCtx.loadContract(web3, Funding.abi, fundingAddress);

      //mint 버튼이 떠야함 -> main.js에서 MintForm이 떠야하는데 그러려면 아래 작업을 해주어야함
      if(fundingContract) {
        console.log('Funding contract deployed to ropsten detwork');
        //fundingContract.nftAddress
        //fundingContract.web3.eth.getAccounts(console.log);

        console.log('fundingContract address',fundingContract); //address 어떻게 찍나? 
        let totalSupply= await fundingCtx.loadTotalSupply(fundingContract);
        fundingCtx.setNftIsLoading(false);  // 이렇게 호출하는게 맞나? 
        fundingCtx.loadCollection(fundingContract, totalSupply)
        //fundingCtx.setNftIsLoading?? loading 
        //console.log('nftisloading : ',fundingCtx.setNftIsLoading);

        //const 
        //undingContract.

        // Load offer count
        // const offerCount = await fundingCtx.loadOfferCount(fundingContract);
        // // Load offers
        // fundingCtx.loadOffers(fundingContract, offerCount); 
        
        // Load User Funds 이건 필요하지 않나?? 
        //account && fundingCtx.loadUserFunds(fundingContract, account);

        // Event OfferFilled subscription 
        // fundingContract.events.OfferFilled()
        // .on('data', (event) => {
        //   fundingCtx.updateOffer(event.returnValues.offerId);
        //   myNFTCtx.updateOwner(event.returnValues.id, event.returnValues.newOwner);
        //   fundingCtx.setMktIsLoading(false);
        // })
        // .on('error', (error) => {
        //   console.log(error);
        // });

        // // Event Offer subscription 
        // fundingContract.events.Offer()
        // .on('data', (event) => {
        //   fundingCtx.addOffer(event.returnValues);
        //   fundingCtx.setMktIsLoading(false);
        // })
        // .on('error', (error) => {
        //   console.log(error);
        // });

        // // Event offerCancelled subscription 
        // fundingContract.events.OfferCancelled()
        // .on('data', (event) => {
        //   fundingCtx.updateOffer(event.returnValues.offerId);
        //   myNFTCtx.updateOwner(event.returnValues.id, event.returnValues.owner);
        //   fundingCtx.setMktIsLoading(false);
        // })
        // .on('error', (error) => {
        //   console.log(error);
        // });
        
      } 
      else {
        window.alert('NFTMarketplace contract not deployed to detected network.')
      }
      // if(mynftContract) {        
      //   // Load total Supply
      //   const totalSupply = await myNFTCtx.loadTotalSupply(mynftContract);
        
      //   // Load Collection
      //   myNFTCtx.loadCollection(mynftContract, totalSupply);       

      //   // Event subscription
      //   mynftContract.events.Transfer()
      //   .on('data', (event) => {
      //     myNFTCtx.updateCollection(mynftContract, event.returnValues.tokenId, event.returnValues.to);
      //     myNFTCtx.setNftIsLoading(false);
      //   })
      //   .on('error', (error) => {
      //     console.log(error);
      //   });
        
      // } else { //현재 이 프로젝트는 contract가 rinkby로 되어있어서 metamask에서 ropsten으로 하면 에러남ㄴ
      //   window.alert('MyNFT contract not deployed to detected network.') 
      // }
     

      //myNFTCtx.setNftIsLoading(false);
      //fundingCtx.setMktIsLoading(false);

      // Metamask Event Subscription - Account changed
      window.ethereum.on('accountsChanged', (accounts) => {
        web3Ctx.loadAccount(web3);
      });

      // Metamask Event Subscription - Network changed
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });
    };
    
    loadBlockchainData();
  }, []);

  // const showNavbar = web3 && myNFTCtx.contract && fundingCtx.contract;
  // const showContent = web3 && myNFTCtx.contract && fundingCtx.contract && web3Ctx.account;

  //현재 생성된 contract는 funding Contract이다 
  const showNavbar = web3 && fundingCtx.contract;
  const showContent = web3 && fundingCtx.contract && web3Ctx.account;
  return(
    <React.Fragment>
      {showNavbar && <Navbar />}
      {showContent && <Main />}
    </React.Fragment>
  );
};

export default App;