var button = document.getElementById("run");
var output = document.getElementById("output");

var waiting = document.createElement("div");
waiting.className = "waiting";
waiting.innerHTML = "> . ";

var mainFunc;

button.onclick = () => {
    output.innerHTML = "";

    setTimeout(() => {
        console.log("Running 'arithRightSearch.c' . . .");

        setTimeout(() => {
            mainFunc();
            output.appendChild(waiting);
        }, 200);
    }, 100);
};

// set up memory buffer
const memory = new WebAssembly.Memory({ initial: 2 });

// Create the Wasi instance passing in some environment variables.
const wasi = new Wasi({
    "LANG": "en_US.UTF-8"
});

const wasi_import = {
    "wasi_snapshot_preview1": wasi,
    "env": {
        "memory": memory
    }
};

if(wasi.instance === null)
{
    WebAssembly.instantiateStreaming(fetch("arithRightTest.wasm"), wasi_import).then(obj => {
        // Initialize the wasi instance
        wasi.init(obj.instance);
        mainFunc = wasi.instance.exports.main;
    });
}