import { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/esm/FloatingLabel';
import Modal from "react-bootstrap/Modal";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/esm/Container';
import { toast } from 'react-toastify';
import ProgressBar from 'react-bootstrap/ProgressBar';

import lighthouse from '@lighthouse-web3/sdk';
import { ethers } from "ethers";
import { useAccount, useContractRead, usePrepareContractWrite, useContractWrite } from 'wagmi';
import { signMessage } from "wagmi/actions";

import TranscriptsArtifactsJson from "../artifacts/contracts/Transcript.sol/Transcripts.json";
import VerifiedUserOracleArtifacts from "../artifacts/contracts/userOracleContract.sol/VerifiedUsersOracle.json";
import Spinner from "./UI/Spinner/Spinner";

const ContractDetails = {
    address: "0x87A555014b415118f690394c2DD2bC7E50082f97",
    abi: TranscriptsArtifactsJson.abi
}
const VerifiedUserOracle = {
    address: "0xe78F5DdB21acF5b76725Ace6239023711c9A5Ad8",
    abi: VerifiedUserOracleArtifacts.abi
}
const TranscriptAddModal = (props) => {
    const [cid, SetCid] = useState("");
    const [buttonOn, setButtonOn] = useState(true);
    const { address: userAddress } = useAccount();
    const [transFile, setTransFile] = useState();
    const [progress, setProgress] = useState();
    useEffect(() => {
        setProgress(0.0);
    },[ ])
    const progressCallback = (progressData) => {
        let percentageDone =
            100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
        console.log(percentageDone);
        setProgress(percentageDone);
    };
    const { config: uploadTransConfig, error: uploadTransPrepError } = usePrepareContractWrite({
        ...ContractDetails,
        functionName: "uploadTranscript",
        args: [props.currentrequestedby || "0x0000000000000000000000000000000000000000",
            props.currentdocumentname ? ethers.utils.formatBytes32String(props.currentdocumentname) : ethers.utils.formatBytes32String(""),
            cid ? ethers.utils.formatBytes32String(cid) : ethers.utils.formatBytes32String("")
        ]
    })
    const {
        data: uploadTransData,
        isLoading: uploadTransIsLoading,
        error: uploadTransError,
        writeAsync: uploadTransWrite,
        isSuccess: uploadTransIsSuccess,
    } = useContractWrite(uploadTransConfig);
    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="add-transcript-request"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Upload Transcript
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>             
            <Form>
                <FloatingLabel controlId="floatingAccount" label="Requested By Address" className='mb-3'>
                    <Form.Control
                        type="text"
                        disabled   
                        value={props.currentrequestedby}
                    />
                </FloatingLabel>
                <FloatingLabel controlId="floatingAccount" label="Document Name" className='mb-3'>
                    <Form.Control
                        type="text"
                        disabled
                        value={props.currentdocumentname}
                    />
                </FloatingLabel>    
                <Form.Control.Feedback type='invalid' >{uploadTransPrepError?.message}</Form.Control.Feedback>                
                <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Upload the Transcript File</Form.Label>
                    <Form.Control type="file" required onChange={(e)=>{setTransFile(e.target.files)}}/>
                </Form.Group>      
                <ProgressBar animated now={progress} />
                <br/>
                    <Button onClick={async () => {     
                    setButtonOn(false);
                    try {
                        const messageRequested = (await lighthouse.getAuthMessage(userAddress)).data.message;
                        const signedMessage = await signMessage({ message: messageRequested });
                        const response = await lighthouse.uploadEncrypted(
                            transFile,
                            "d5bca996.658fe784ce7a4740b69691c94d1322eb", //api key
                            userAddress,
                            signedMessage,
                            null,
                            progressCallback
                        );
                        const { Hash } = response.data[0];
                        console.log(Hash)
                        const conditions = [
                            {
                                id: 1,
                                chain: "Calibration",
                                method: "hasAccess",
                                standardContractType: "Custom",
                                contractAddress: "0xc43673681B44E14F345Fe60F86EEB69ce259B640",
                                returnValueTest: {
                                    comparator: "==",
                                    value: 1
                                },
                                parameters: [":userAddress"],
                                inputArrayType: ["address"],
                                outputType: "uint256",
                            },
                        ];
                        const aggregator = "([1])";
                        const res = await lighthouse.applyAccessCondition(
                            userAddress,
                            Hash,
                            signedMessage,
                            conditions,
                            aggregator
                        );
                        console.log(res.data);
                        SetCid(Hash);
                        const txHash = await uploadTransWrite?.();
                        console.log(txHash?.hash);
                        toast.success("Uploaded Transcript Successfully");
                        if (uploadTransIsSuccess) {
                            toast.success("Uploaded Transcript Successfully");
                        }
                    } catch (error) {
                        console.log(error);
                        toast.error(error.message ? error.message : "Upload Failed!")
                    }     
                    setButtonOn(true);
                    }} variant="info"
                    disabled={!buttonOn || uploadTransIsLoading || uploadTransPrepError}>
                Add Transcript Request</Button>        
            </Form>
            </Modal.Body>
        </Modal>
    );
}
function TestUI() {
    const encryptionSignature = async() =>{
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const messageRequested = (await lighthouse.getAuthMessage(address)).data.message;
      const signedMessage = await signer.signMessage(messageRequested);
      return({
        signedMessage: signedMessage,
        publicKey: address
      });
    }
  
    const applyAccessConditions = async(e) =>{
      // CID on which you are applying encryption
      // CID is generated by uploading a file with encryption
      // Only the owner of the file can apply access conditions
      const cid = "QmV6uP96f58or1cTRcFFzB5QVUUn7pzbR4ATbkahp7Wawz";
  
      // Conditions to add
      const conditions = [
        {
            id: 1,
            chain: "Calibration",
            method: "hasAccess",
            contractAddress: "0xc43673681B44E14F345Fe60F86EEB69ce259B640",
            standardContractType: "Custom",
            returnValueTest: {
                comparator: "==",
                value: 1
            },
            parameters: [":_content", ":userAddress"],
            inputArrayType: ["bytes32", "address"],
            outputType: "uint256"
        },
      ];
  
      // Aggregator is what kind of operation to apply to access conditions
      // Suppose there are two conditions then you can apply ([1] and [2]), ([1] or [2]), !([1] and [2]).
      const aggregator = "([1])";
      const {publicKey, signedMessage} = await encryptionSignature();
      console.log(publicKey)
      /*
        accessCondition(publicKey, cid, signedMessage, conditions, aggregator)
          Parameters:
            publicKey: owners public key
            CID: CID of the file to decrypt
            signedMessage: message signed by the owner of publicKey
            conditions: should be in a format like above
            aggregator: aggregator to apply conditions
      */
      const response = await lighthouse.applyAccessCondition(
        publicKey,
        cid,
        signedMessage,
        conditions,
        aggregator
      );
  
      console.log(response);
      
      /*
        {
          data: {
            cid: "QmZkEMF5y5Pq3n291fG45oyrmX8bwRh319MYvj7V4W4tNh",
            status: "Success"
          }
        }
      */
    }
  
    return (
      <div className="App">
        <button onClick={()=>{applyAccessConditions()}}>Apply Access Conditions</button>
      </div>
    );
  }


const InstitutionPage = () => {
    const [modalShow, setModalShow] = useState(false);
    const [uploadButton, hideUploadButton] = useState(false);
    const [currentrequestedby, setCurrentRequestedBy] = useState();
    const [currentdocumentname, setcurrentdocumentname] = useState();
    const { address:userAddress } = useAccount();
    const { data: institutionRequests, error: institutionRequestsError,
        isLoading: institutionRequestsIsLoading } = useContractRead({
            ...ContractDetails,
            functionName: "getAllInstitutionTranscriptRequest",
            account: userAddress
        });
    return (
        <>
        <TranscriptAddModal currentrequestedby={currentrequestedby} currentdocumentname={currentdocumentname} show={modalShow} onHide={() => { setModalShow(false); hideUploadButton(false) }} />    
        <Container fluid className='text-center my-5'>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>#</th>
                    <th>Person Who Requested</th>
                    <th>Document Name</th>
                    <th>Upload Transcript</th>
                </tr>
                </thead>
                <tbody>
                    {institutionRequestsIsLoading && institutionRequestsError ? <Spinner /> :
                    institutionRequests ? institutionRequests.map((el, idx) => {
                    return (
                        <tr key={"requests_"+idx}>
                            <td>{idx}</td>
                            <td>{el.requestedBy}</td>
                            <td>{el.documentName}</td>
                            <td><Button onClick={() => {
                                hideUploadButton(true);
                                setcurrentdocumentname(el.documentName);
                                setCurrentRequestedBy(el.requestedBy);
                                setModalShow(true);
                            }} disabled={uploadButton}>Upload Transcript</Button></td>
                        </tr>
                    );
                    }) : "No Requests" }    
                </tbody>
            </Table>
        </Container>
        <TestUI/>
        </>
    );
}

export default InstitutionPage;