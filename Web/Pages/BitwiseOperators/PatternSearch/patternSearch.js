var button = document.getElementById("run");
var output = document.getElementById("output");

var waiting = document.createElement("div");
waiting.className = "waiting";
waiting.innerHTML = "> . ";

const emptyArr = ["", "", ""];

var mainFunc;
var x;

button.onclick = () => {
    output.innerHTML = "";

    let inputArr = handleInputs();
x = inputArr;
    // no inputs provided
    if(arr_equals(inputArr, emptyArr))
        mainFunc(0, []);
    else if(inputArr[1] === "-1" || inputArr[2] === "-1") // incorrect input
        console.log("Please correct your inputs.");
    else if(inputArr[1] === "") // default first value
        mainFunc(3, ["", "ABCDEF12", inputArr[2]]);
    else if(inputArr[2] === "") // default second value
        mainFunc(3, ["", inputArr[1], "AB"]);
    else // both inputs
        mainFunc(3, inputArr);

    output.appendChild(waiting);
};

const isHex = (numString) => { return Boolean(numString.match(/^[0-9a-f]+$/i)) };

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
    WebAssembly.instantiateStreaming(fetch("patternSearch3.wasm"), wasi_import).then(obj => {
        // Initialize the wasi instance
        wasi.init(obj.instance);
        mainFunc = wasi.instance.exports.__main_argc_argv;
    });
}

function handleInputs()
{
    let inputArr = ["", "-1", "-1"];

    let number = document.querySelector('[name="number"]').value;

        if(number === "" || isHex(number))
            inputArr[1] = number;
        else
            console.log("Error: 'Number' must be a hexadecimal number.");

    let pattern = document.querySelector('[name="pattern"]').value;
    
        if(pattern === "" || isHex(pattern))
            inputArr[2] = pattern;
        else
            console.log("Error: 'Pattern' must be a hexadecimal number.");

    return inputArr;
}

const arr_equals = (array1, array2) => array1.length === array2.length && array1.every((value, index) => value === array2[index]);