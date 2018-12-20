# teleterminal

Host a terminal command using a web server

# Installation

```
$ npm install -g teleterminal
```
> teleterminal is available in the terminal as `teleterminal` as well as `tt` for short.

# Getting Started

```
$ tt --help

Usage: teleterminal command [options]
       tt command [options]

Options:
-i, --interactive   | false | Allow users to send keyboard input
-m, --multi-session | false | Start a new instance of the command for each connected user
-p, --port          | 3000  | TCP port for the server to listen on
-h, --help          | false | Show this help screen
--history           | 1000  | Lines of command history to serve (single session only)
--cols              | 80    | Number of terminal columns (single session only)
--rows              | 43    | Number of terminal rows (single session only)

Examples:
tt 'ping something.com'
tt 'ls -a' -i -m
```
