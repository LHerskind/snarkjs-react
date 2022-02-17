import React, { useState } from "react";
import "./App.css";

import { Field, Input, Text, Button, Link } from "rimble-ui";

const snarkjs = require("snarkjs");

// const getSolidityProofArray = (proof: any) => {
// 	let proofList = [
// 		proof["pi_a"][0],
// 		proof["pi_a"][1],
// 		proof["pi_b"][0][1],
// 		proof["pi_b"][0][0],
// 		proof["pi_b"][1][1],
// 		proof["pi_b"][1][0],
// 		proof["pi_c"][0],
// 		proof["pi_c"][1],
// 	];
// 	return proofList;
// };

const makeProof = async (_proofInput: any, _wasm: string, _zkey: string) => {
	const { proof, publicSignals } = await snarkjs.groth16.fullProve(_proofInput, _wasm, _zkey);
	return { proof, publicSignals };
};

const verifyProof = async (_verificationkey: string, signals: any, proof: any) => {
	const vkey = await fetch(_verificationkey).then(function (res) {
		return res.json();
	});
console.log({vkey})
console.log({signals})
console.log({proof})
	const res = await snarkjs.groth16.verify(vkey, signals, proof);
	return res;
};

function App() {
	const [latitude, setA] = useState("12973547807205025");
	const [longitude, setB] = useState("7500977777251771");

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
		console.log(proofInput);

		makeProof(proofInput, wasmFile, zkeyFile).then(({ proof: _proof, publicSignals: _signals }) => {
			setProof(JSON.stringify(_proof, null, 2));
			setSignals(JSON.stringify(_signals, null, 2));
      console.log(_proof)
			// verifyProof(verificationKey, _signals, _proof).then((_isValid) => {
			// 	setIsValid(_isValid);
			// });
		});
	};

	const changeA = (e) => {
		setA(e.target.value);
	};

	const changeB = (e) => {
		setB(e.target.value);
	};

	return (
		<div>
			<header className="App-header">
				<Text>
					The underlying circuit is from the <a href="https://github.com/iden3/snarkjs">snarkjs readme</a>
				</Text>
				<pre>Witness Inputs</pre>
				<Field label="Input a:">
					<Input type="text" required={true} value={latitude} onChange={changeA} placeholder="e.g. 3" />
				</Field>
				<Field label="Input b:">
					<Input type="text" required={true} value={longitude} onChange={changeB} placeholder="e.g. 11" />
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
