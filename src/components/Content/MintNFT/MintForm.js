import { useState, useContext } from 'react';

import Web3Context from '../../../store/web3-context';
//import CollectionContext from '../../../store/collection-context';
import FundingContext from '../../../store/funding-context';
import web3 from '../../../connection/web3';

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

const MintForm = () => {  
  const [enteredName, setEnteredName] = useState('');
  const [descriptionIsValid, setDescriptionIsValid] = useState(true);

  const [enteredDescription, setEnteredDescription] = useState('');
  const [nameIsValid, setNameIsValid] = useState(true);

  const [enteredPrice, setEnteredPrice] = useState('');
  const [PriceIsValid, setPriceIsValid] = useState(true);

  const [capturedFileBuffer, setCapturedFileBuffer] = useState(null);
  const [fileIsValid, setFileIsValid] = useState(true);

  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(FundingContext);

  const enteredPriceHandler = (event) => {
    setEnteredPrice(event.target.value);
  };

  const enteredNameHandler = (event) => {
    setEnteredName(event.target.value);
  };

  const enteredDescriptionHandler = (event) => {
    setEnteredDescription(event.target.value);
  };
  
  const captureFile = (event) => {
    event.preventDefault();

    const file = event.target.files[0];

    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setCapturedFileBuffer(Buffer(reader.result));     
    }
  };  
  
  const submissionHandler = (event) => {
    event.preventDefault();

    enteredName ? setNameIsValid(true) : setNameIsValid(false);
    enteredDescription ? setDescriptionIsValid(true) : setDescriptionIsValid(false);
    capturedFileBuffer ? setFileIsValid(true) : setFileIsValid(false);
    enteredPrice ? setPriceIsValid(true) : setPriceIsValid(false);

    const formIsValid = enteredName && enteredDescription && capturedFileBuffer && enteredPrice;

    // Upload file to IPFS and push to the blockchain
    const mintNFT = async() => { //모든 항목을 넣고 mint 버튼을 누르면 비동기적으로 수행되는 로직 
      // Add file to the IPFS
      const fileAdded = await ipfs.add(capturedFileBuffer);
      if(!fileAdded) {
        console.error('Something went wrong when updloading the file');
        return;
      }

      const metadata = {
        title: "Asset Metadata",
        type: "object",
        properties: {
          name: {
            type: "string",
            description: enteredName
          },
          description: {
            type: "string",
            description: enteredDescription
          },
          image: {
            type: "string",
            description: fileAdded.path
          }
        }
      };

      const metadataAdded = await ipfs.add(JSON.stringify(metadata));
      if(!metadataAdded) {
        console.error('Something went wrong when updloading the file');
        return;
      }
      
      collectionCtx.contract.methods.mintMynftPriced(metadataAdded.path,web3.utils.toWei(enteredPrice)).send({ from: web3Ctx.account })
      .on('transactionHash', (hash) => {
        console.log('minting Success ',hash);
        collectionCtx.setNftIsLoading(true);
      })
      .on('error', (e) =>{
        window.alert('Something went wrong when pushing to the blockchain');
        collectionCtx.setNftIsLoading(false);  
      })      
    };

    formIsValid && mintNFT();
  };

  const nameClass = nameIsValid? "form-control" : "form-control is-invalid";
  const descriptionClass = descriptionIsValid? "form-control" : "form-control is-invalid";
  const fileClass = fileIsValid? "form-control" : "form-control is-invalid";
  const priceClass = PriceIsValid? "form-control" : "form-control is-invalid";
  
  return(
    <form onSubmit={submissionHandler}>
      <div className="row justify-content-center">
         <div className="col-md-2">
          <input
            type='text'
            className={`${nameClass} mb-1`}
            placeholder='Name...'
            value={enteredName}
            onChange={enteredNameHandler}
          />
        </div>
        <div className="col-md-2">
          <input
            type='text'
            className={`${priceClass} mb-1`}
            placeholder='Price...'
            value={enteredPrice}
            onChange={enteredPriceHandler}
          />
        </div>
        <div className="col-md-6">
          <input
            type='text'
            className={`${descriptionClass} mb-1`}
            placeholder='Description...'
            value={enteredDescription}
            onChange={enteredDescriptionHandler}
          />
        </div>
        <div className="col-md-2">
          <input
            type='file'
            className={`${fileClass} mb-1`}
            onChange={captureFile}
          />
        </div>
      </div>
      <button type='submit' className='btn btn-lg btn-info text-white btn-block'>MINT</button>
    </form>
  );
};

export default MintForm;