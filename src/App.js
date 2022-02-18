import React, { useState } from "react";
import "./App.css";

import { Field, Input, Text, Button, Link } from "rimble-ui";
import { utils } from "ffjavascript";
import publicConstraint from "./zkproof/public.json"
const snarkjs = require("snarkjs");
const { unstringifyBigInts } = utils;

const getSolidityProofArray = (proof) => {
   let proofList = [
      proof["pi_a"][0],
      proof["pi_a"][1],
      proof["pi_b"][0][1],
      proof["pi_b"][0][0],
      proof["pi_b"][1][1],
      proof["pi_b"][1][0],
      proof["pi_c"][0],
      proof["pi_c"][1],
   ];
   return proofList;
};

const makeProof = async (_proofInput, _wasm, _zkey) => {
   const { proof, publicSignals } = await snarkjs.groth16.fullProve(_proofInput, _wasm, _zkey);
   return { proof, publicSignals };
};

const verifyProof = async (_verificationkey, signals, proof) => {
   const vkey = await fetch(_verificationkey).then(function (res) {
      return res.json();
   });
   console.log({ vkey });
   console.log({ signals });
   console.log({ proof });
   const res = await snarkjs.groth16.verify(vkey, signals, proof);
   return res;
};

function App() {
   const [latitude, setA] = useState("12973547807205025");
   const [longitude, setB] = useState("7500977777251779");

   const [proof, setProof] = useState("");
   const [signals, setSignals] = useState("");
   const [isValid, setIsValid] = useState(false);

   let wasmFile = "http://localhost:8000/AtEthDenver.wasm";
   let zkeyFile = "http://localhost:8000/AtEthDenver_0001.zkey";
   let verificationKey = "http://localhost:8000/verification_key.json";

   const runProofs = () => {
      console.log(longitude.length);
      if (latitude.length == 0 || longitude.length == 0) {
         return;
      }
      let proofInput = { latitude, longitude };

      makeProof(proofInput, wasmFile, zkeyFile).then(async ({ proof: _proof, publicSignals: _signals }) => {
         setProof(JSON.stringify(_proof, null, 2));
         setSignals(JSON.stringify(_signals, null, 2));
        //  console.log(_proof);
        //  const contractCall = [
        //     [_proof.pi_a[0], _proof.pi_a[1]],
        //     [_proof.pi_b[0], _proof.pi_b[1]],
        //     [_proof.pi_c[0], _proof.pi_c[1]],
        //     [
        //        "0x0000000000000000000000000000000000000000000000000000000000000001",
        //        "0x000000000000000000000000000000000000000000000000002e1739f4f8b856",
        //        "0x000000000000000000000000000000000000000000000000001aa65a9d52c5a8",
        //     ],
        //  ];
         _proof.protocol = "groth16"

         const callData = await zkeyExportSolidityCalldata(_proof, {});

         console.log(callData)
        //  verifyProof(verificationKey, _signals, _proof).then((_isValid) => {
        //     setIsValid(_isValid);
        //  });
      });
   };

   const changeA = (e) => {
      setA(e.target.value);
   };

   const changeB = (e) => {
      setB(e.target.value);
   };
   async function zkeyExportSolidityCalldata(_proof, options) {

      const pub = unstringifyBigInts(publicConstraint);
      const proof = unstringifyBigInts(_proof);

      let res;
      if (proof.protocol === "groth16") {
          res = await snarkjs.groth16.exportSolidityCallData(proof, pub);
          } else if (proof.protocol === "plonk") {
             res = await snarkjs.plonk.exportSolidityCallData(proof, pub);
            } else {
               throw new Error("Invalid Protocol");
              }

      return res;
   }

   return (
      <div>
         <header className='App-header'>
            <Text>
               The underlying circuit is from the <a href='https://github.com/iden3/snarkjs'>snarkjs readme</a>
            </Text>
            <pre>Witness Inputs</pre>
            <Field label='Input a:'>
               <Input type='text' required={true} value={latitude} onChange={changeA} placeholder='e.g. 3' />
            </Field>
            <Field label='Input b:'>
               <Input type='text' required={true} value={longitude} onChange={changeB} placeholder='e.g. 11' />
            </Field>
            <Button.Outline onClick={runProofs}>Generate Proof</Button.Outline>
            Proof: <Text width={1 / 2}>{proof}</Text>
            Signals: <Text>{signals}</Text>
            Result:
            {proof.length > 0 && <Text>{isValid ? "Valid proof" : "Invalid proof"}</Text>}
         </header>
      </div>
   );
}

export default App;
