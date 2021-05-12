// A class to manage the wasm memory
class WasiMemoryManager
{
    constructor(memory, malloc, free)
    {
        this.memory = memory;
        this.malloc = malloc;
        this.free   =   free;
    }

    // Convert a pointer from the wasm module to JavaScript string.
    convertToString(ptr, length)
    {
        try {
            // The pointer is a multi byte character array encoded with utf-8.
            const array   = new Uint8Array(this.memory.buffer, ptr, length);
            const decoder = new TextDecoder();
            const string  = decoder.decode(array);

            return string;
        } finally {
            // Free the memory
            this.free(ptr);
        }
    }

    // Convert a JavaScript string to a pointer to multi byte character array
    convertFromString(string)
    {
        // Encode the string in utf-8.
        const encoder = new TextEncoder();
        const bytes   = encoder.encode(string);

        // Copy the string into memory allocated in the WebAssembly
        const ptr    = this.malloc(bytes.byteLength);
        const buffer = new Uint8Array(this.memory.buffer, ptr, bytes.byteLength + 1);

        buffer.set(bytes);

        return buffer;
    }

    // convert an array of JavaScript strings to a pointer to a multi-byte character array
    convertFromArray(stringArr)
    {
        const encoder = new TextEncoder();

        // encode each string in utf-8, store in an array of bytes
        let bytes = [];
        stringArr.forEach(string => bytes.push(new Uint8Array(encoder.encode(string), )));
y = bytes;
        let length = 0;
        bytes.forEach(string => length += string.byteLength);
console.log("length: " + length);
        const ptr    = this.malloc(length);
        const buffer = new Uint8Array(this.memory.buffer, ptr, length);

        buffer.set(bytes);

        return buffer;
    }
}

var y;