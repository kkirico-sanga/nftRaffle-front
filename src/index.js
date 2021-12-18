import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';

import Web3Provider from './store/Web3Provider';
import CollectionProvider from './store/CollectionProvider';
import MarketplaceProvider from './store/MarketplaceProvider';

import FundingProvider from './store/FundingProvider';
import myNFTProvider from './store/myNFTProvider';

import App from './App';

ReactDOM.render(
  <Web3Provider>
    <FundingProvider>
        <App />
    </FundingProvider>
  </Web3Provider>, 
  document.getElementById('root')
);