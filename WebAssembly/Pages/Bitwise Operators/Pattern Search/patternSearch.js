var button = document.getElementById("run");
var output = document.getElementById("Output");

var waiting = document.createElement("div");
waiting.className = "waiting";
waiting.innerHTML = "> . "

button.onclick = () => {
    output.innerHTML = "";
    
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
        await WebAssembly.instantiateStreaming(fetch("patternSearch.wasm"), { wasi_snapshot_preview1: wasi }).then(obj => {
            // Initialise the wasi instance
            wasi.init(obj.instance);
            wasi.instance.exports.main("ABCDEF12", "AB");
        });
    }
    else
        wasi.instance.exports.main("ABCDEF12", "AB");
}