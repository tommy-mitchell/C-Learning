var button = document.getElementById("run");
var output = document.getElementById("output");

var waiting = document.createElement("div");
waiting.className = "waiting";
waiting.innerHTML = "> . "

button.onclick = () => {
    output.innerHTML = "";

    console.log("Running 'intSize.c'");
    
    setTimeout(() => {
        main().then(() => {
            output.appendChild(waiting);
        });
    }, 100);
};

// Create the Wasi instance passing in some environment variables.
const wasi = new Wasi({
    "LANG": "en_US.UTF-8",
    "TERM": "xterm"
});

async function main()
{
    if(wasi.instance === null)
    {
        await WebAssembly.instantiateStreaming(fetch("intSize.wasm"), { wasi_snapshot_preview1: wasi }).then(obj => {
            // Initialize the wasi instance
            wasi.init(obj.instance);
            wasi.instance.exports.main();
        });
    }
    else
        wasi.instance.exports.main();
}