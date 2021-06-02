const WASI_ESUCCESS   = 0;
const WASI_ERRNO_BADF = 8;

const WASI_FILETYPE_UNKNOWN 		 = 0;
const WASI_FILETYPE_BLOCK_DEVICE 	 = 1;
const WASI_FILETYPE_CHARACTER_DEVICE = 2;
const WASI_FILETYPE_DIRECTORY 	     = 3;
const WASI_FILETYPE_REGULAR_FILE 	 = 4;
const WASI_FILETYPE_SOCKET_DGRAM 	 = 5;
const WASI_FILETYPE_SOCKET_STREAM 	 = 6;
const WASI_FILETYPE_SYMBOLIC_LINK 	 = 7;

const WASI_FDFLAGS_APPEND   =  1;
const WASI_FDFLAGS_DSYNC    =  2;
const WASI_FDFLAGS_NONBLOCK =  4;
const WASI_FDFLAGS_RSYNC    =  8;
const WASI_FDFLAGS_SYNC     = 16;

const WASI_RIGHTS_FD_DATASYNC 			  = 		1n;
const WASI_RIGHTS_FD_READ 				  = 		2n;
const WASI_RIGHTS_FD_SEEK 				  = 		4n;
const WASI_RIGHTS_FD_FDSTAT_SET_FLAGS 	  = 		8n;
const WASI_RIGHTS_FD_SYNC 				  = 	   16n;
const WASI_RIGHTS_FD_TELL 				  = 	   32n;
const WASI_RIGHTS_FD_WRITE 				  = 	   64n;
const WASI_RIGHTS_FD_ADVISE 			  = 	  128n;
const WASI_RIGHTS_FD_ALLOCATE 			  = 	  256n;
const WASI_RIGHTS_PATH_CREATE_DIRECTORY   = 	  512n;
const WASI_RIGHTS_PATH_CREATE_FILE 		  = 	 1024n;
const WASI_RIGHTS_PATH_LINK_SOURCE 		  = 	 2048n;
const WASI_RIGHTS_PATH_LINK_TARGET 		  = 	 4096n;
const WASI_RIGHTS_PATH_OPEN 			  = 	 8192n;
const WASI_RIGHTS_FD_READDIR 			  = 	16384n;
const WASI_RIGHTS_PATH_READLINK 		  = 	32768n;
const WASI_RIGHTS_PATH_RENAME_SOURCE 	  = 	65536n;
const WASI_RIGHTS_PATH_RENAME_TARGET 	  =    131072n;
const WASI_RIGHTS_PATH_FILESTAT_GET       =    262144n;
const WASI_RIGHTS_PATH_FILESTAT_SET_SIZE  =    524288n;
const WASI_RIGHTS_PATH_FILESTAT_SET_TIMES =   1048576n;
const WASI_RIGHTS_FD_FILESTAT_GET         =   2097152n;
const WASI_RIGHTS_FD_FILESTAT_SET_SIZE	  =   4194304n;
const WASI_RIGHTS_FD_FILESTAT_SET_TIMES   =   8388608n;
const WASI_RIGHTS_PATH_SYMLINK 			  =  16777216n;
const WASI_RIGHTS_PATH_REMOVE_DIRECTORY   =  33554432n;
const WASI_RIGHTS_PATH_UNLINK_FILE 		  =  67108864n;
const WASI_RIGHTS_POLL_FD_READWRITE 	  = 134217728n;
const WASI_RIGHTS_SOCK_SHUTDOWN 		  = 268435456n;

const STDIN  = 0;
const STDOUT = 1;
const STDERR = 2;

let inputted = false;
const timeout = async ms => new Promise(res => setTimeout(res, ms));
const delay = (time) => new Promise(resolve => setTimeout(() => resolve(), time));

function drainWriter(write, prev, current)
{
	let text = prev + current;

	while(text.includes('\n'))
	{
		const [line, rest] = text.split('\n', 2);
		write(line);

		console.warn("line: " + line + ", rest: " + rest);

		if(line.includes("Enter"))
		{
			/*while(inputted === false)
			{
				(async () => {
					await timeout(1000);
				})();
			}

			inputted === false;*/

			//console.warn("rest: " + rest);
		}
		
		text = rest;
	}

	return text;
}

// An implementation of WASI which supports the minimum required to use multi-byte characters.
class Wasi
{
	constructor(env)
	{
		this.env 			   = env;
		this.instance 		   = null;
		this.wasiMemoryManager = null;
		this.stdinHandler      = null;//() => console.log("No stdin handler.");
		this.stdoutText        = '';
		this.stderrText 	   = '';
		this.args			   = [];
	}

	// Initialise the instance from the WebAssembly.
	init = (instance) => {
		this.instance = instance;
		this.wasiMemoryManager = new WasiMemoryManager(
			instance.exports.memory,
			instance.exports.malloc,
			instance.exports.free
		);
	};

	args_sizes_get = (argc, argv_buf_size) => {
        let buffer = new DataView(this.wasiMemoryManager.memory.buffer);

        //console.log("args_sizes_get(", argc, ", ", argv_buf_size, ")");

        buffer.setUint32(argc, this.args.length, true);

        let buf_size = 0;
        for(let arg of this.args)
            buf_size += arg.length + 1;

        buffer.setUint32(argv_buf_size, buf_size, true);
        //console.log(buffer.getUint32(argc, true), buffer.getUint32(argv_buf_size, true));

        return WASI_ESUCCESS;
    };

    args_get = (argv, argv_buf) => {
        let buffer = new DataView(this.wasiMemoryManager.memory.buffer);
        let buffer8 = new Uint8Array(this.wasiMemoryManager.memory.buffer);

        //console.log("args_get(", argv, ", ", argv_buf, ")");

        let orig_argv_buf = argv_buf;

        for(let i = 0; i < this.args.length; i++)
		{
            buffer.setUint32(argv, argv_buf, true);
            argv += 4;
            let arg = new TextEncoder("utf-8").encode(this.args[i]);
            buffer8.set(arg, argv_buf);
            buffer.setUint8(argv_buf + arg.length, 0);
            argv_buf += arg.length + 1;
        }

        //console.log(new TextDecoder("utf-8").decode(buffer8.slice(orig_argv_buf, argv_buf)));

        return WASI_ESUCCESS;
    };

  	// Get the environment variables.
	environ_get = (environ, environBuf) => {
		const encoder = new TextEncoder();
		const    view = new DataView(this.wasiMemoryManager.memory.buffer);

		Object.entries(this.env).map(
			([key, value]) => `${key}=${value}`
		).forEach(envVar => {
			view.setUint32(environ, environBuf, true);
			environ += 4;

			const bytes = encoder.encode(envVar);
			const   buf = new Uint8Array(this.wasiMemoryManager.memory.buffer, environBuf, bytes.length + 1);

			environBuf += buf.byteLength;
		});

		return WASI_ESUCCESS;
	};
  
	// Get the size required to store the environment variables.
	environ_sizes_get = (environCount, environBufSize) => {
		const encoder = new TextEncoder();
		const    view = new DataView(this.wasiMemoryManager.memory.buffer);

		const envVars = Object.entries(this.env).map(
			([key, value]) => `${key}=${value}`
		);

		const size = envVars.reduce(
			(acc, envVar) => acc + encoder.encode(envVar).byteLength + 1,
			0
		);

		view.setUint32(environCount, envVars.length, true);
		view.setUint32(environBufSize, size, true);

		return WASI_ESUCCESS;
	};

	// This gets called on exit to stop the running program.
	// We don't have anything to stop!
	proc_exit = rval => {
		return WASI_ESUCCESS;
	};

	fd_close = fd => {
		return WASI_ESUCCESS;
	};

	fd_seek = (fd, offset_low, offset_high, whence, newOffset) => {
		return WASI_ESUCCESS;
	};

	fd_write = (fd, iovs, iovsLen, nwritten) => {
		// only care about 'stdout' and 'stderr'
		if(!(fd === STDOUT | fd === STDERR))
			return WASI_ERRNO_BADF;

		const view = new DataView(this.wasiMemoryManager.memory.buffer);

		// create a UInt8Array for each buffer
		const buffers = Array.from({ length: iovsLen }, (_, i) => {
			const    ptr = iovs + i * 8;
			const    buf = view.getUint32(ptr, true);
			const bufLen = view.getUint32(ptr + 4, true);

			return new Uint8Array(this.wasiMemoryManager.memory.buffer, buf, bufLen);
		});

		const textDecoder = new TextDecoder();

		let    text = '';
		let written = 0;
	
		// turn each buffer into one long utf-8 string
		buffers.forEach(buf => {
			   text += textDecoder.decode(buf);
			written += buf.byteLength;
		});

		// return the bytes written
		view.setUint32(nwritten, written, true);

		console.warn("text: " + text);

		if(fd === STDOUT)
			this.stdoutText = drainWriter(console.log,   this.stdoutText, text);
		else if(fd == STDERR)
			this.stderrText = drainWriter(console.error, this.stderrText, text);

		return WASI_ESUCCESS;
	}

	fd_read = (fd, iovs, iovsLen, nread) => {
		// only care about 'stdin'
		if(fd !== STDIN)
			return WASI_ERRNO_BADF;

		const encoder = new TextEncoder();

		const view = new DataView(this.wasiMemoryManager.memory.buffer);
		view.setUint32(nread, 0, true);

		// create a UInt8Array for each buffer
		const buffers = Array.from({ length: iovsLen }, (_, i) => {
			const    ptr = iovs + i * 8;
			const    buf = view.getUint32(ptr, true);
			const bufLen = view.getUint32(ptr + 4, true);

			return new Uint8Array(this.wasiMemoryManager.memory.buffer, buf, bufLen);
		});

		// get input for each buffer and set them and the view
		buffers.forEach(buf => {
			//const input = "1\n";
			console.warn("input");
			/*let input = "1\n";
			
			this.stdinHandler().then(value => {
				//input = value + '\n';
				//inputted = true;
				console.log(value);
			});*/
			let input = "1\n";

			const getInput = async () => {
				input = await this.stdinHandler() + '\n';
				console.log(input);
			};

			getInput();

			/*const data = (async (handler) => {
				//return await handler() + '\n';
				let val = await handler() + '\n';
				console.log("data: " + val);
				return val;
			})(this.stdinHandler);

			let data = "";
			
			const waitForInput = (func) => setTimeout(func, 500);

			(async () => {
				waitForInput(async () => {
					await this.stdinHandler().then(value => {
						data = value + '\n';
						console.log("inputted: " + value);
						return;
					})
				});
			})();*/

			buf.set(encoder.encode(input));
			view.setUint32(nread, view.getUint32(nread, true) + input.length, true);
		});

        /*let buffer  = new   DataView(this.wasiMemoryManager.memory.buffer);
        let buffer8 = new Uint8Array(this.wasiMemoryManager.memory.buffer);

        console.log("fd_read("+ fd+ ", "+ iovs+ ", "+ iovsLen+ ", "+ nread+ ")");

		buffer.setUint32(nread, 0, true);

		for(let i = 0; i < iovsLen; i++) 
		{
			let [ptr, len] = [buffer.getUint32(iovs + 8 * i, true), buffer.getUint32(iovs + 8 * i + 4, true)];
			let [data, err] = fds[fd].read(len);

			if(err != 0)
				return err;

			const data = (async (handler) => {
				//return await handler() + '\n';
				let val = await handler() + '\n';
				console.log("data: " + val);
				return val;
			})(this.stdinHandler);

			let data = "";
			
			const waitForInput = (func) => setTimeout(func, 500);

			(async () => {
				waitForInput(async () => {
					await this.stdinHandler().then(value => {
						data = value + '\n';
						console.log("inputted: " + value);
						return;
					})
				});
			})();


			console.log("data: " + data);
			buffer8.set(new TextEncoder().encode(data), ptr);
			buffer.setUint32(nread, buffer.getUint32(nread, true) + data.length, true);
			console.log("input: " + buffer8);
		}*/
		
		return WASI_ESUCCESS;
    }

	fd_fdstat_get = (fd, stat) => {
		// only care about 'stdout' and 'stderr'
		if(!(fd === STDOUT | fd === STDERR))
			return WASI_ERRNO_BADF;

		const view = new DataView(this.wasiMemoryManager.memory.buffer);

		// filetype
		view.setUint8(stat + 0, WASI_FILETYPE_CHARACTER_DEVICE);
		// fdflags
		view.setUint32(stat + 2, WASI_FDFLAGS_APPEND, true);
		// rights base
		view.setBigUint64(stat + 8, WASI_RIGHTS_FD_WRITE, true);
		// rights inheriting
		view.setBigUint64(stat + 16, WASI_RIGHTS_FD_WRITE, true); 

		return WASI_ESUCCESS;
	}
}

// override console.log() to instead write in output on page
window.console.log = function(str) {
	str = "> " + str;

	var node = document.createElement("div");
	node.appendChild(document.createTextNode(str));
	document.getElementById("output").appendChild(node);
}