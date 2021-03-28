import React, { useState } from "react";
import "./App.css";

import { Field, Input, Text, Button, Link } from "rimble-ui";

const snarkjs = require("snarkjs");

const getSolidityProofArray = (proof: any) => {
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

const makeProof = async (_proofInput: any, _wasm: string, _zkey: string) => {
	const { proof, publicSignals } = await snarkjs.groth16.fullProve(_proofInput, _wasm, _zkey);
	return { proof, publicSignals };
};

const verifyProof = async (_verificationkey: string, signals: any, proof: any) => {
	const vkey = await fetch(_verificationkey).then(function (res) {
		return res.json();
	});

	const res = await snarkjs.groth16.verify(vkey, signals, proof);
	return res;
};

function App() {
	const [a, setA] = useState("3");
	const [b, setB] = useState("11");

	const [proof, setProof] = useState("");
	const [signals, setSignals] = useState("");
	const [isValid, setIsValid] = useState(false);

	let wasmFile = "http://localhost:8000/circuit.wasm";
	let zkeyFile = "http://localhost:8000/circuit_final.zkey";
	let verificationKey = "http://localhost:8000/verification_key.json";

	const runProofs = () => {
		console.log(b.length);
		if (a.length == 0 || b.length == 0) {
			return;
		}
		let proofInput = { a, b };
		console.log(proofInput);

		makeProof(proofInput, wasmFile, zkeyFile).then(({ proof: _proof, publicSignals: _signals }) => {
			setProof(JSON.stringify(_proof, null, 2));
			setSignals(JSON.stringify(_signals, null, 2));
			verifyProof(verificationKey, _signals, _proof).then((_isValid) => {
				setIsValid(_isValid);
			});
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
					<Input type="text" required={true} value={a} onChange={changeA} placeholder="e.g. 3" />
				</Field>
				<Field label="Input b:">
					<Input type="text" required={true} value={b} onChange={changeB} placeholder="e.g. 11" />
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
