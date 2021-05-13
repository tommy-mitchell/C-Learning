const isHex = (numString) => { return Boolean(numString.match(/^[0-9a-f]+$/i)) };

function handleInputs()
{
    let inputArr = ["", "-1", "-1"];

    const getValue = (name, index) => {
        let value = document.querySelector(`[name="${name}"]`).value;

        if(value === "" || isHex(value))
            inputArr[index] = value;
        else
            console.log(`Error: '${name}' must be a hexadecimal number.`);
    };

    getValue( "number", 1);
    getValue("pattern", 2);

    return inputArr;
}

const patternRunner = () => {
    let inputArr = handleInputs();

    if(inputArr[1] === "-1" || inputArr[2] === "-1") // incorrect input
        console.log("Please correct your inputs.");
    else // run
    {
        if(arr_equals(inputArr, ["", "", ""])) // no inputs provided
            wasi.args = [];
        else if(inputArr[1] === "") // default first value
            wasi.args = [inputArr[0], "ABCDEF12", inputArr[2]];
        else if(inputArr[2] === "") // default second value
            wasi.args = [inputArr[0], inputArr[1], "AB"];
        else // both inputs
            wasi.args = inputArr;

        main();
    }
};

initialize("patternSearch", patternRunner);