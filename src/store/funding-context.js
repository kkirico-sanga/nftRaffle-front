import React from 'react';

//contract에 값을 갖고 와서 만들어보는 함수 
const FundingContext = React.createContext({
  contract: null,
  totalSupply: null,
  collection: [],
  nftIsLoading: true,
  userFunds: null,
  loadContract: () => {},
  loadTotalSupply: () => {},
  loadCollection: () => {},
  setNftIsLoading: () => {}
  //loadUserFunds: () => {}
});

export default FundingContext;