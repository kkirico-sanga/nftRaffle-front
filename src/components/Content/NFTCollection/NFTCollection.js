import { useContext, useState } from 'react';

import web3 from '../../../connection/web3';
import Web3Context from '../../../store/web3-context';
// import CollectionContext from '../../../store/collection-context';
// import MarketplaceContext from '../../../store/marketplace-context';
import FundingContext from '../../../store/funding-context';
import MyNFTContext from '../../../store/myNFT-context';

import { formatPrice } from '../../../helpers/utils';
import eth from '../../../img/eth.png';
import MyVerticallyCenteredModal from './Modal';

const NFTCollection = () => {
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(FundingContext);
  const myNFTCtx = useContext(MyNFTContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpen2, setModalOpen2] = useState(false);
  const modalClose = () => {
    setModalOpen(!modalOpen)
  }
   const fundingHandler = (event) => {    
    modalClose();
  };

  const modalClose2 = () => {
    collectionCtx.contract.methods.randomNFTOwner(0).send({from: web3Ctx.account})
    .on('transactionHash', (hash) => {
      myNFTCtx.contract.methods.randomDeployNFT(0,"0xf2Eb4508083a48eEA198dd2f3178fd019CAdb681"); //랜덤으로 참여자들에게 뿌려준다
    })
  }
   const raffleHandler = (event) => {    
    modalClose2();
  };
  
  return (
      <div className="row text-center">
       {collectionCtx.collection.map((NFT, key) => {
        const owner = NFT.owner;
        return (
          <>
            <MyVerticallyCenteredModal
              nftowner = {NFT.owner}
              show={modalOpen}
              onHide={() => setModalOpen(false)}
              tokenid={key}
              key={key}
            />
            <div className="col-md-2 m-3 pb-3 card border-info">
              <div className={"card-body"}>
                <h5 className="card-title">{NFT.title}</h5>
              </div>
              <img
                src={`https://ipfs.infura.io/ipfs/${NFT.img}`}
                className="card-img-bottom"
                alt={`NFT ${key}`}
              />
              <p className="fw-light fs-6">{`${owner.substr(
                0,
                7
              )}...${owner.substr(owner.length - 7)}`}</p>
              { (
                <div className="row">
                    {Number(NFT.fundingPot) !== Number(NFT.price) ? (
                    <div className="d-grid gap-2 col-5 mx-auto">
                      <button
                        onClick={modalClose}
                        value={NFT.id}
                        className="btn btn-success"
                      >
                        Funding
                      </button>
                    </div>) : (<div className="d-grid gap-2 col-5 mx-auto">
                      <button
                        onClick={modalClose2}
                        value={NFT.id}
                        className="btn btn-success"
                      >
                        Raffle
                      </button>
                    </div>)
                    }
                  <div className="d-flex justify-content-end">
                    price:

                    <p className="text-start">
                      <b>{`${web3.utils.fromWei(NFT.price)}`} eth</b>
                    </p>
                  </div>
                  <div className="d-flex justify-content-end">
                    funding:
                    <p className="text-start">
                      <b>{`${web3.utils.fromWei(NFT.fundingPot)}`} eth</b>
                    </p>
                  </div>
                </div>
              )}
          </div>
          </>
        );
      })}
      </div>
  );
};

export default NFTCollection;


  // const makeOfferHandler = (event, id, key) => {
  //   event.preventDefault();

  //   const enteredPrice = web3.utils.toWei(priceRefs.current[key].current.value, 'ether');

  //   collectionCtx.contract.methods.approve(collectionCtx.contract.options.address, id).send({ from: web3Ctx.account })
  //   .on('transactionHash', (hash) => {
  //     collectionCtx.setNftIsLoadingHandler(true);
  //   })
  //   .on('receipt', (receipt) => {      
  //     collectionCtx.contract.methods.makeOffer(id, enteredPrice).send({ from: web3Ctx.account })
  //     .on('error', (error) => {
  //       window.alert('Something went wrong when pushing to the blockchain');
  //       collectionCtx.setNftIsLoadingHandler(false);
  //     }); 
  //   });
  // };
  
  // const buyHandler = (event) => {    
  //   const buyIndex = parseInt(event.target.value);      
  //   collectionCtx.contract.methods.fillOffer(collectionCtx.offers[buyIndex].offerId).send({ from: web3Ctx.account, value: collectionCtx.offers[buyIndex].price })
  //   .on('transactionHash', (hash) => {
  //     collectionCtx.setNftIsLoadingHandler(true);
  //   })
  //   .on('error', (error) => {
  //     window.alert('Something went wrong when pushing to the blockchain');
  //     collectionCtx.setNftIsLoadingHandler(false);
  //   });            
  // };

