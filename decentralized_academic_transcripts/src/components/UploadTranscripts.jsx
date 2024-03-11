import React from "react";
import lighthouse from '@lighthouse-web3/sdk';
import { useState } from 'react';
// MUI
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// Wagmi
import { useAccount, useSignMessage } from "wagmi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function CircularProgressWithLabel(
  props
) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}


const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function UploadTranscriptsPage() {
  const [file, setFile] = useState(null);
  const { address: accountAddress } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const navigate = useNavigate();
  // const [progress, setProgress] = useState(0);
  // const progressCallback = (p) => {
  //   setProgress(p);
  // }
  const apiKey = import.meta.env.VITE_APP_LIGHTHOUSE_API_KEY

  const signAuthMessage = async () => {
    const { message } = (await lighthouse.getAuthMessage(accountAddress)).data
    const signature = await signMessageAsync({ message: message });
    return signature;
  }

  const uploadEncryptedFile = async () => {
    if (!file) {
      console.error("No file selected.")
      return
    }
    try {
      const signature = await toast.promise(signAuthMessage, {
        pending: "Waiting for your Signature...",
        success: "Message Successfully Signed!",
        error: "Error Signing Message! Please Try Agian!"
      });
      if (!signature) {
        return
      }
      const output = await toast.promise(lighthouse.uploadEncrypted(
        file,
        apiKey,
        accountAddress,
        signature,
        progressCallback
      ), {
        pending: "Uploading Encrypted file to Lighthouse IPFS...",
        success: "Successfully Uploaded!",
        error: "An Error Occurred while Uploading! Please Try Agian!"
      });
      toast.info(`Encrypted File IPFS Hash: ${output.data[0].Hash}\nDecrypt at https://decrypt.mesh3.network/evm/${output.data[0].Hash}`);
    } catch (error) {
      toast.error(`Error uploading encrypted file: ${error}`);
    }
  }
  const handleFileChange = (e) => {
    const uplFiles = e.target.files
    console.log(uplFiles);
    if (uplFiles) {
      setFile(uplFiles);
    }
  }

  return (
    <div>
      {file ? file[0].name :
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          Upload File
          <VisuallyHiddenInput type="file" onChange={handleFileChange} />
        </Button>}
      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
        disabled={!file}
        onClick={async () => {
          await uploadEncryptedFile();
        }}
      >
        Upload To IPFS
      </Button>
      <CircularProgressWithLabel value={progress} />;
    </div>
  )

}

export default UploadTranscriptsPage;