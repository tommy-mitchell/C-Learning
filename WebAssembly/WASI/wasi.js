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

const STDOUT = 1;
const STDERR = 2;

function drainWriter(write, prev, current)
{
	let text = prev + current;

	while(text.includes('\n'))
	{
		const [line, rest] = text.split('\n', 2);
		write(line);
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
		this.stdoutText        = '';
		this.stderrText 	   = '';
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
		
		// turn each buffer into a utf-8 string
		buffers.forEach(buf => {
			   text += textDecoder.decode(buf);
			written += buf.byteLength;
		});

		// return the bytes written
		view.setUint32(nwritten, written, true);

		if(fd === STDOUT)
			this.stdoutText = drainWriter(window.console.log,   this.stdoutText, text);
		else if(fd == STDERR)
			this.stderrText = drainWriter(console.error, this.stderrText, text);

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

	/*args_sizes_get = (argc, argvBuf) => {
		// argv: 
	}

	args_get*/
}

// override console.log() to instead write in output on page
window.console = {
	log: function(str){
		str = "> " + str;

		var node = document.createElement("div");
		node.appendChild(document.createTextNode(str));
		document.getElementById("Output").appendChild(node);
	}
}