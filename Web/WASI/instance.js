const wasi = new Wasi({
    "LANG": "en_US.UTF-8"
});

let main = null;

// takes a wasm file name to instantiate, returns the main function
async function initInstance(name)
{
    await WebAssembly.instantiateStreaming(fetch(`${name}.wasm`), { wasi_snapshot_preview1: wasi }).then(obj => {
        // initialize the wasi instance
        wasi.init(obj.instance);

        main = wasi.instance.exports.main;//__main_argc_argv;
    });
}

const button = document.getElementById("run");
const output = document.getElementById("output");

const waiting = Object.assign(document.createElement("div"), {
                                className: "waiting",
                                innerHTML: "> . "
                              });

// takes the source file name and a function to run
function initialize(name, runner)
{
    // initialize WASI instance
    initInstance(name).then(() => {
        // wait for WASI instance to be initialized before adding listener
        button.onclick = () => {
            // clear output
            output.innerHTML = "";
    
            // delay for clear
            setTimeout(() => {
                console.log(`Running '${name}.c'`);
                
                // delay as if it's "running"
                setTimeout(() => {
                    // call program-specific handler
                    runner();
        
                    // write a "> . . " as if it's a shell
                    output.appendChild(waiting);
                }, 200);
            }, 100);
        };
    });
}