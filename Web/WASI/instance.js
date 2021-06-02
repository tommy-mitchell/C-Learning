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

        //main = wasi.instance.exports.main;
        //main = wasi.instance.exports.__main_argc_argv;
        main = wasi.instance.exports._start;
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
                console.log(`Running '${name}.c' . . .`);
                
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

const arr_equals = (array1, array2) => array1.length === array2.length && array1.every((value, index) => value === array2[index]);
const      isHex =      (numString) => { return Boolean(numString.match(/^[0-9a-f]+$/i)) };
const      isNum =      (numString) => { return Boolean(numString.match(/^[0-9]+$/i)) };

/**
 *  values[] Object: {
 *       name: string,
 *      index: int,
 *       test: function,
 *      error: function
 *  }
 * 
 *  returns inputArr
 */
function handleInputs(values)
{
    let inputArr = ["", "-1", "-1"];

    const getValue = (valueObj) => {
        if(valueObj === undefined)
            return;

        let value = document.querySelector(`[name="${valueObj.name}"]`).value;
    
        if(valueObj.test(value))
            inputArr[valueObj.index] = value;
        else
            console.log(valueObj.error(valueObj.name));
    };

    getValue(values[0]);
    getValue(values[1]);

    return inputArr;
}

function resize(hide, text)
{
    hide.textContent = text.value;
    text.style.width = hide.offsetWidth + "px";
}

let inputDiv = document.createElement("div");
    inputDiv.append(Object.assign(document.createElement("span"),  { 
        innerHTML: "> " 
    }));

const hide = Object.assign(document.createElement("span"),  { 
        id: "hide" 
    });
inputDiv.append(hide);

const text = Object.assign(document.createElement("input"), { 
        type: "text",
        name: "stdin",
        id: "text",
        //autofocus: "true"
    });
inputDiv.append(text);