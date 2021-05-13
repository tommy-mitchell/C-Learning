function handleInputs()
{
    let inputArr = ["", "", ""];

    inputArr[1] = `${document.querySelector('[name="number1"]').value}`;
    inputArr[2] = `${document.querySelector('[name="number2"]').value}`;

    return inputArr;
}

const swapRunner = () => {
    let inputArr = handleInputs();

    if(arr_equals(inputArr, ["", "", ""])) // no inputs provided
        wasi.args = [];
    else
        wasi.args = inputArr;

    main();
};

initialize("swapTest", swapRunner);