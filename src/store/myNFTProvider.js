import { useReducer } from "react";


import MyNFTContext from './myNFT-context';

const defaultMyNFTState = {
    contract: null,
    totalSupply: null,
    collection: []
};

const MyNFTReducer=(state, action)=> {
    if(action.type === 'CONTRACT') {    
        return {
          contract: action.contract,
          collection:state.collection
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
          collection: action.collection,
        };
      }

      return defaultMyNFTState;
}

const MyNFTProbider = props =>{
    const [CollectionState, dispatchNFTAction] = useReducer(MyNFTReducer, defaultMyNFTState);

    const loadContractHandler = (web3, abi, address) => {
    console.log("MyNFT Contract is load!!");
    const contract = address ? new web3.eth.Contract(abi, address): '';
    dispatchNFTAction({type: 'CONTRACT', contract: contract}); 
    return contract;
  };
  const loadTotalSupplyHandler = async(contract) => {
    console.log("[MyNFT] loadTotalSupplyHandler is load!!");
    const totalSupply = await contract.methods.totalSupply().call();
    dispatchNFTAction({type: 'LOADSUPPLY', totalSupply: totalSupply});
    return totalSupply;
  };

  const loadCollectionHandler = async(contract, totalSupply) => {
    let collection = [];
    console.log("loadCollectionHandler is load!!");
    for(let i = 0; i < totalSupply; i++) {
      const hash = await contract.methods._tokenURIs(i).call(); 
      console.log("hash : ",hash);
      try {
        const response = await fetch(`https://ipfs.infura.io/ipfs/${hash}?clear`);
        if(!response.ok) {
          throw new Error('Something went wrong');
        }

        const metadata = await response.json();
        const owner = await contract.methods.ownerOf(i + 1).call();

        collection = [{
          id: i + 1,
          title: metadata.properties.name.description,
          img: metadata.properties.image.description,
          owner: owner
        }, ...collection];
      }catch {
        console.error('Something went wrong');
      }
    }
    dispatchNFTAction({type: 'LOADCOLLECTION', collection: collection});     
  };
  const myNFTContext = {
    contract: CollectionState.contract,
    totalSupply: CollectionState.totalSupply,
    collection: CollectionState.collection,
    loadContract: loadContractHandler,
    loadTotalSupply: loadTotalSupplyHandler,
    loadCollection: loadCollectionHandler,
  };
  return (
    <MyNFTContext.Provider value={myNFTContext}>
      {props.children}
    </MyNFTContext.Provider>
  );
}

//   const MyNFTContext = React.createContext({
//     contract: null,
//     collection: [],
//     nftIsLoading: true,
//     loadContract: () => {},
//     loadCollection: () => {},
//   //   updateTotalSupply: () => {},
//   //   updateCollection: () => {},
//   //   updateOwner: () => {},
//   //   setNftIsLoading: () => {}
//   });
  