import React from 'react';

const MyNFTContext = React.createContext({
  contract: null,
  collection: [],
  loadContract: () => {},
  loadCollection: () => {},
//   updateTotalSupply: () => {},
//   updateCollection: () => {},
//   updateOwner: () => {},
//   setNftIsLoading: () => {}
});

export default MyNFTContext;