<script>
	let ws = new WebSocket("ws://localhost:8081");
	let txtBox = "";
	let lastTxt;
	let gotfromServer = "";
	ws.onmessage = message => {
		console.log(`Received: ${message.data}`)
		if (message.data.split("\0")[0] == "update"){ // Key value lamda it
			txtBox = message.data.replace("update\0","");
			lastTxt = txtBox;
			gotfromServer = message.data.replace("update\0","");
		}
	};
	ws.onopen = () => {
		// ws.send("Hello! I'm client")
	}
	function handleUpdate(){
		console.log("Update");
		let insert = "";
		for(let i = 0; i < (txtBox.length > lastTxt.length ? txtBox.length : lastTxt.length); i++){
			if (txtBox[i] !== lastTxt[i]) {
				console.log("Diff "+txtBox[i] +" vs "+ lastTxt[i]);
				if (txtBox.length > lastTxt.length){
					insert += txtBox[i];
				} else {
					insert += "\b";
				}
			}
		}
		ws.send("update\0"+insert+"\0"+parseInt(i));
		txtBox = lastTxt;
	}
</script>

<main>
	<input bind:value={txtBox} on:input={handleUpdate}>
	<input>
	<p>{gotfromServer}</p>
</main>

<style>
	/* main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	p {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	} */
</style>