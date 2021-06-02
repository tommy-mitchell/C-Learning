# C Learning

A repository to document my learning of C during the summer of 2019, using [this book](https://www.goodreads.com/book/show/16248728-programming-in-c-4th-edition). Some examples were from the book (primarily the bitwise operators), others from the web, and one was a recreation of a game from my high school CS class.

## Online Demos

An online version of this repository can be found [here](https://tommy-mitchell.github.io/C-Learning/).

Using [WASI-SDK's](https://github.com/WebAssembly/wasi-sdk) included [wasi-libc](https://github.com/WebAssembly/wasi-libc), I compiled these demos into WebAssembly and implemented a barebones [WASI](https://wasi.dev/) interface in JavaScript following [this tutorial](https://rob-blackbourn.github.io/blog/webassembly/wasm/strings/javascript/c/libc/wasm-libc/clang/2020/06/20/wasm-stdout-stderr.html). I used the following command to compile each `.c` file:

    `clang --target=wasm32-unknown-wasi --sysroot=<sysroot> -O3 -flto -Wl,--export=malloc -Wl,--export-all -Wl,--lto-O3 src.c -o src.wasm`

From there, I made a script ([instance.js](Web/WASI/instance.js)) that would instatiate each WASM source and handle inputs for it, so that all each page had to do was call `instatiate` with some optional program-specific runners.
