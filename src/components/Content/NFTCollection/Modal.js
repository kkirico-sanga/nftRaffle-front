import React, { useContext, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import myNFT from "../../../abis/MyNFT.json";
import web3 from "../../../connection/web3";
import FundingContext from "../../../store/funding-context";
import Web3Context from "../../../store/web3-context";
const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient.create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});
function MyVerticallyCenteredModal(props) {

  const [enteredName, setEnteredName] = useState("");
  const [descriptionIsValid, setDescriptionIsValid] = useState(true);
  const [enteredDescription, setEnteredDescription] = useState("");
  const [nameIsValid, setNameIsValid] = useState(true);
  const [capturedFileBuffer, setCapturedFileBuffer] = useState(null);
  const [fileIsValid, setFileIsValid] = useState(true);
  const web3Ctx = useContext(Web3Context);
  const pricenftCtx = useContext(FundingContext);
  // 값을 변경시켜주는 함수다.
  const enteredNameHandler = (event) => {
    //window.alert(props.nftowner); //이거 안됨 
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
      
    };
  };
  const submissionHandler = (event) => {
    event.preventDefault();
    enteredName ? setNameIsValid(true) : setNameIsValid(false);
    enteredDescription
      ? setDescriptionIsValid(true)
      : setDescriptionIsValid(false);
    capturedFileBuffer ? setFileIsValid(true) : setFileIsValid(false);
    const formIsValid = enteredName && enteredDescription && capturedFileBuffer;

    // Upload file to IPFS and push to the blockchain
    const mintNFT = async () => {
      // Add file to the IPFS
      const fileAdded = await ipfs.add(capturedFileBuffer);
      if (!fileAdded) {
        console.error("Something went wrong when updloading the file");
        return;
      }
      const metadata = {
        title: "Asset Metadata",
        type: "object",
        properties: {
          name: {
            type: "string",
            description: enteredName,
          },
          description: {
            type: "string",
            description: enteredDescription,
          },
          image: {
            type: "string",
            description: fileAdded.path,
          },
        },
      };
      const metadataAdded = await ipfs.add(JSON.stringify(metadata));
     
      if (!metadataAdded) {
        console.error("Something went wrong when updloading the file");
        return;
      }
      //Contract 만들 때 계정을 선택해야함..
      const contract = new web3.eth.Contract(
        myNFT.abi,
        "0x75Da190f86D74A702a65F1eB7A2fd35beFc85F5C" //Funding Contract owner
      );
      contract.methods
        .mintMynft(metadataAdded.path,0) //무조건 0번한테 보내기
        .send({ from: web3Ctx.account })
        .on("transactionHash", (hash) => {
     
          pricenftCtx.contract.methods
            .funding(0)
            .send({ from: web3Ctx.account, value: web3.utils.toWei("0.1") })
            .on("transactionHash", (hash) => {
              pricenftCtx.setNftIsLoading(true);
            })
            .on("error", (error) => {
              window.alert(
                "Something went wrong when pushing to the blockchain"
              );
              pricenftCtx.setNftIsLoading(false);
            });
        })
        .on("error", (e) => {
          window.alert("Something went wrong when pushing to the blockchain");
        });
    };
    formIsValid && mintNFT();
  };
  const nameClass = nameIsValid ? "form-control" : "form-control is-invalid";
  const descriptionClass = descriptionIsValid
    ? "form-control"
    : "form-control is-invalid";
  const fileClass = fileIsValid ? "form-control" : "form-control is-invalid";
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          나의 NFT 등록하기<br></br>
          펀딩을 하기 위해서는 나만의 NFT를 만들어야합니다.
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={submissionHandler}>
          <div className="column justify-content-center">
            <div className="row-md-2">
              <input
                type="text"
                className={`${nameClass} mb-1`}
                placeholder="Name..."
                value={enteredName}
                onChange={enteredNameHandler}
              />
            </div>
            <div className="row-md-4">
              <input
                type="text"
                className={`${descriptionClass} mb-1`}
                placeholder="Description..."
                value={enteredDescription}
                onChange={enteredDescriptionHandler}
              />
            </div>
            <div className="row-md-2">
              <input
                type="file"
                className={`${fileClass} mb-1`}
                onChange={captureFile}
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-lg btn-info text-white btn-block"
          >
            MINT
          </button>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
export default MyVerticallyCenteredModal;