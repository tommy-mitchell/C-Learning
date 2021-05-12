var WASI_Polyfill = {
    proc_exit() { console.log("proc_exit"); },
    random_get() { console.log("random_get"); },
    args_sizes_get(argc, argv_buf_size) {
        let buffer = new DataView(inst.exports.memory.buffer);
        console.log("args_sizes_get(", argc, ", ", argv_buf_size, ")");
        buffer.setUint32(argc, args.length, true);
        let buf_size = 0;
        for (let arg of args) {
            buf_size += arg.length + 1;
        }
        buffer.setUint32(argv_buf_size, buf_size, true);
        console.log(buffer.getUint32(argc, true), buffer.getUint32(argv_buf_size, true));
        return 0;
    },
    args_get(argv, argv_buf) {
        let buffer = new DataView(inst.exports.memory.buffer);
        let buffer8 = new Uint8Array(inst.exports.memory.buffer);
        console.log("args_get(", argv, ", ", argv_buf, ")");
        let orig_argv_buf = argv_buf;
        for (let i = 0; i < args.length; i++) {
            buffer.setUint32(argv, argv_buf, true);
            argv += 4;
            let arg = new TextEncoder("utf-8").encode(args[i]);
            buffer8.set(arg, argv_buf);
            buffer.setUint8(argv_buf + arg.length, 0);
            argv_buf += arg.length + 1;
        }
        console.log(new TextDecoder("utf-8").decode(buffer8.slice(orig_argv_buf, argv_buf)));
        return 0;
    },

    environ_sizes_get(environ_count, environ_size) {
        let buffer = new DataView(inst.exports.memory.buffer);
        console.log("environ_sizes_get(", environ_count, ", ", environ_size, ")");
        buffer.setUint32(environ_count, env.length, true);
        let buf_size = 0;
        for (let environ of env) {
            buf_size += environ.length + 1;
        }
        buffer.setUint32(environ_size, buf_size, true);
        console.log(buffer.getUint32(environ_count, true), buffer.getUint32(environ_size, true));
        return 0;
    },
    environ_get(environ, environ_buf) {
        let buffer = new DataView(inst.exports.memory.buffer);
        let buffer8 = new Uint8Array(inst.exports.memory.buffer);
        console.log("environ_get(", environ, ", ", environ_buf, ")");
        let orig_environ_buf = environ_buf;
        for (let i = 0; i < env.length; i++) {
            buffer.setUint32(environ, environ_buf, true);
            environ += 4;
            let e = new TextEncoder("utf-8").encode(env[i]);
            buffer8.set(e, environ_buf);
            buffer.setUint8(environ_buf + e.length, 0);
            environ_buf += e.length + 1;
        }
        console.log(new TextDecoder("utf-8").decode(buffer8.slice(orig_environ_buf, environ_buf)));
        return 0;
    },

    clock_time_get(id, precision, time) {
        let buffer = new DataView(inst.exports.memory.buffer);
        //console.log("clock_time_get(", id, ", ", precision, ", ", time, ")");
        buffer.setBigUint64(time, 0n, true);
        return 0;
    },
    fd_close() { console.log("fd_close"); },
    fd_filestat_get(fd, buf) {
        let buffer = new DataView(inst.exports.memory.buffer);
        console.warn("fd_filestat_get(", fd, ", ", buf, ")");
        if (fds[fd] != undefined) {
            let stat = fds[fd].stat();
            buffer.setBigUint64(buf, stat.dev, true);
            buffer.setBigUint64(buf + 8, stat.ino, true);
            buffer.setUint8(buf + 16, stat.file_type);
            buffer.setBigUint64(buf + 24, stat.nlink, true);
            buffer.setBigUint64(buf + 32, stat.size, true);
            buffer.setBigUint64(buf + 38, stat.atim, true);
            buffer.setBigUint64(buf + 46, stat.mtim, true);
            buffer.setBigUint64(buf + 52, stat.ctim, true);
            return 0;
        } else {
            return -1;
        }
    },
    fd_read(fd, iovs_ptr, iovs_len, nread_ptr) {
        let buffer = new DataView(inst.exports.memory.buffer);
        let buffer8 = new Uint8Array(inst.exports.memory.buffer);
        //console.log("fd_read(", fd, ", ", iovs_ptr, ", ", iovs_len, ", ", nread_ptr, ")");
        if (fds[fd] != undefined) {
            buffer.setUint32(nread_ptr, 0, true);
            for (let i = 0; i < iovs_len; i++) {
                let [ptr, len] = [buffer.getUint32(iovs_ptr + 8 * i, true), buffer.getUint32(iovs_ptr + 8 * i + 4, true)];
                let [data, err] = fds[fd].read(len);
                if (err != 0) {
                    return err;
                }
                buffer8.set(data, ptr);
                buffer.setUint32(nread_ptr, buffer.getUint32(nread_ptr, true) + data.length, true);
            }
            return 0;
        } else {
            return -1;
        }
    },
    fd_readdir(fd, buf, buf_len, cookie, bufused) {
        let buffer = new DataView(inst.exports.memory.buffer);
        let buffer8 = new Uint8Array(inst.exports.memory.buffer);
        console.warn("fd_readdir(", fd, ", ", buf, ", ", buf_len, ", ", cookie, ", ", bufused, ")");
        // 8 ,  3408816 ,  128 ,  0n ,  1032332
        if (fds[fd] != undefined && fds[fd].directory != undefined) {
            buffer.setUint32(bufused, 0, true);

            console.log(cookie, Object.keys(fds[fd].directory).slice(Number(cookie)));
            if (cookie >= BigInt(Object.keys(fds[fd].directory).length)) {
                console.log("end of dir");
                return 0;
            }
            let next_cookie = cookie + 1n;
            for (let name of Object.keys(fds[fd].directory).slice(Number(cookie))) {
                let entry = fds[fd].directory[name];
                console.log(name, entry);
                let encoded_name = new TextEncoder("utf-8").encode(name);

                let offset = 24 + encoded_name.length;

                if ((buf_len - buffer.getUint32(bufused, true)) < offset) {
                    console.log("too small buf");
                    break;
                } else {
                    console.log("next_cookie =", next_cookie, buf);
                    buffer.setBigUint64(buf, next_cookie, true);
                    next_cookie += 1n;
                    buffer.setBigUint64(buf + 8, 1n, true); // inode
                    buffer.setUint32(buf + 16, encoded_name.length, true);
                    buffer.setUint8(buf + 20, entry.file_type);
                    buffer8.set(encoded_name, buf + 24);
                    console.log("buffer =", buffer8.slice(buf, buf + offset));
                    buf += offset;
                    buffer.setUint32(bufused, buffer.getUint32(bufused, true) + offset, true);
                    console.log();
                }
            }
            console.log("used =", buffer.getUint32(bufused, true));
            return 0;
        } else {
            return -1;
        }
    },
    fd_seek() { console.log("fd_seek"); },
    fd_write(fd, iovs_ptr, iovs_len, nwritten_ptr) {
        let buffer = new DataView(inst.exports.memory.buffer);
        let buffer8 = new Uint8Array(inst.exports.memory.buffer);
        //console.log("fd_write(", fd, ", ", iovs_ptr, ", ", iovs_len, ", ", nwritten_ptr, ")");
        if (fds[fd] != undefined) {
            buffer.setUint32(nwritten_ptr, 0, true);
            for (let i = 0; i < iovs_len; i++) {
                let [ptr, len] = [buffer.getUint32(iovs_ptr + 8 * i, true), buffer.getUint32(iovs_ptr + 8 * i + 4, true)];
                console.log(ptr, len, buffer8.slice(ptr, ptr + len));
                let err = fds[fd].write(buffer8.slice(ptr, ptr + len));
                if (err != 0) {
                    return err;
                }
                buffer.setUint32(nwritten_ptr, buffer.getUint32(nwritten_ptr, true) + len, true);
            }
            return 0;
        } else {
            return -1;
        }
    },
    path_create_directory() {
        console.log("path_create_directory");
    },
    path_filestat_get(fd, flags, path_ptr, path_len, buf) {
        let buffer = new DataView(inst.exports.memory.buffer);
        let buffer8 = new Uint8Array(inst.exports.memory.buffer);
        console.warn("path_filestat_get(", fd, ", ", flags, ", ", path_ptr, ", ", path_len, ", ", buf, ")");
        if (fds[fd] != undefined && fds[fd].directory != undefined) {
            let path = new TextDecoder("utf-8").decode(buffer8.slice(path_ptr, path_ptr + path_len));
            console.log("file =", path);
            let entry = fds[fd].get_entry_for_path(path);
            if (entry == null) {
                return -1;
            }
            // FIXME write filestat_t
            return 0;
        } else {
            return -1;
        }
    },
    path_link() { console.log("path_link"); },
    path_open(fd, dirflags, path_ptr, path_len, oflags, fs_rights_base, fs_rights_inheriting, fdflags, opened_fd_ptr) {
        let buffer = new DataView(inst.exports.memory.buffer);
        let buffer8 = new Uint8Array(inst.exports.memory.buffer);
        console.log("path_open(",
            dirflags, ", ",
            path_ptr, ", ",
            path_len, ", ",
            oflags, ", ",
            fs_rights_base, ", ",
            fs_rights_inheriting, ", ",
            fdflags, ", ",
            opened_fd_ptr, ")",
        );
        if (fds[fd] != undefined && fds[fd].directory != undefined) {
            let path = new TextDecoder("utf-8").decode(buffer8.slice(path_ptr, path_ptr + path_len));
            console.log(path);
            let entry = fds[fd].get_entry_for_path(path);
            if (entry == null) {
                if (oflags & OFLAGS_CREAT == OFLAGS_CREAT) {
                    entry = fds[fd].create_entry_for_path(path);
                } else {
                    return -1;
                }
            } else if (oflags & OFLAGS_EXCL == OFLAGS_EXCL) {
                return -1;
            }
            if (oflags & OFLAGS_DIRECTORY == OFLAGS_DIRECTORY && fds[fd].file_type != FILETYPE_DIRECTORY) {
                return -1;
            }
            if (oflags & OFLAGS_TRUNC == OFLAGS_TRUNC) {
                entry.truncate();
            }
            fds.push(entry.open());
            let opened_fd = fds.length - 1;
            buffer.setUint32(opened_fd_ptr, opened_fd, true);
        } else {
            return -1;
        }
    },
    path_readlink() { console.log("path_readlink"); },
    path_remove_directory() { console.log("path_remove_directory"); },
    path_rename() { console.log("path_rename"); },
    path_unlink_file() { console.log("path_unlink_file"); },
    sched_yield() { console.log("sched_yield"); },
    fd_prestat_get(fd, buf_ptr) {
        let buffer = new DataView(inst.exports.memory.buffer);
        console.log("fd_prestat_get(", fd, ", ", buf_ptr, ")");
        if (fds[fd] != undefined && fds[fd].prestat_name != undefined) {
            const PREOPEN_TYPE_DIR = 0;
            buffer.setUint32(buf_ptr, PREOPEN_TYPE_DIR, true);
            buffer.setUint32(buf_ptr + 4, fds[fd].prestat_name.length);
            return 0;
        } else {
            return -1;
        }

    },
    fd_prestat_dir_name(fd, path_ptr, path_len) {
        console.log("fd_prestat_dir_name(", fd, ", ", path_ptr, ", ", path_len, ")");
        if (fds[fd] != undefined && fds[fd].prestat_name != undefined) {
            let buffer8 = new Uint8Array(inst.exports.memory.buffer);
            buffer8.set(fds[fd].prestat_name, path_ptr);
            return 0;
        } else {
            return -1;
        }
    },
};