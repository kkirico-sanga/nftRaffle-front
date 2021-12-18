import { useReducer } from 'react';

import FundingContext from './funding-context';

const defaultCollectionState = {
  contract: null,
  totalSupply: null,
  collection: [],
  nftIsLoading: true
  // userFunds: null
};

const PriceNFTPeducer = (state, action) => {
  if(action.type === 'CONTRACT') {    
    return {
      contract: action.contract,
      totalSupply: state.totalSupply,
      collection: state.collection,
      nftIsLoading: state.nftIsLoading
    };
  } 
  
  if(action.type === 'LOADSUPPLY') {
    return {
      contract: state.contract,
      totalSupply: action.totalSupply,
      collection: state.collection,
      nftIsLoading: state.nftIsLoading
    };
  }

  if(action.type === 'LOADCOLLECTION') {    
    return {
      contract: state.contract,
      totalSupply: state.totalSupply,
      collection: action.collection,
      nftIsLoading: state.nftIsLoading
    };
  }
  if(action.type === 'LOADING') {    
    return {
      contract: state.contract,
      totalSupply: state.totalSupply,
      collection: state.collection,
      nftIsLoading: action.loading
    };
  }
  // if(action.type === 'LOADFUNDS') {
  //   return {
  //     contract: state.contract,
  //     offerCount: state.offerCount,
  //     offers: state.offers,
  //     userFunds: action.userFunds,
  //     mktIsLoading: state.mktIsLoading
  //   };
  // }
  
  
  return defaultCollectionState;
};

const FundingProvider = props => {
  const [CollectionState, dispatchCollectionAction] = useReducer(PriceNFTPeducer, defaultCollectionState);
  const loadContractHandler = (web3, abi, address) => {
    const contract = address ? new web3.eth.Contract(abi, address): '';
    console.log("Funding Contract is load!!", address);
    dispatchCollectionAction({type: 'CONTRACT', contract: contract}); 
    return contract;
  };

  const loadTotalSupplyHandler = async(contract) => {
    console.log("loadTotalSupplyHandler is load!!");
    const totalSupply = await contract.methods.tokenID().call();
    dispatchCollectionAction({type: 'LOADSUPPLY', totalSupply: totalSupply});
    return totalSupply;
  };

  const loadCollectionHandler = async(contract, totalSupply) => {
    let collection = [];
    console.log("loadCollectionHandler is load!!");
    for(let i = 0; i < totalSupply; i++) {
      const hash = await contract.methods._tokenURIs(i).call();
      try {
        const response = await fetch(`https://ipfs.infura.io/ipfs/${hash}?clear`);
        if(!response.ok) {
          throw new Error('Something went wrong');
        }

        const metadata = await response.json();
        const owner = await contract.methods.ownerOf(i).call();
        const price = await contract.methods.prices(i).call();
        const fundingPot = await contract.methods.fundingPot(i).call();
        console.log('price ',price);
        console.log('fundingPot ',fundingPot);
        // contract에서 데이터를 가져옴
        collection = [{
          id: i,
          title: metadata.properties.name.description,
          img: metadata.properties.image.description,
          owner: owner,
          price:price,
          fundingPot:fundingPot,
        }, ...collection];
      }catch {
        console.error('Something went wrong');
      }
    }
    console.log('collection:',collection);
    dispatchCollectionAction({type: 'LOADCOLLECTION', collection: collection});     
  };

  // const loadUserFundsHandler = async(contract, account) => {
  //   const userFunds = await contract.methods.userFunds(account).call();
  //   dispatchCollectionAction({type: 'LOADFUNDS', userFunds: userFunds});
  //   return userFunds;
  // };

  const setNftIsLoadingHandler = (loading) => {
    dispatchCollectionAction({type: 'LOADING', loading: loading});
  };

  const collectionContext = {
    contract: CollectionState.contract,
    totalSupply: CollectionState.totalSupply,
    collection: CollectionState.collection,
    nftIsLoading:CollectionState.nftIsLoading,
    loadContract: loadContractHandler,
    loadTotalSupply: loadTotalSupplyHandler,
    loadCollection: loadCollectionHandler,
    setNftIsLoading:setNftIsLoadingHandler,
  };
  return (
    <FundingContext.Provider value={collectionContext}>
      {props.children}
    </FundingContext.Provider>
  );
};

export default FundingProvider;