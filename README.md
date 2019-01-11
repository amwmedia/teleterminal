# teleterminal

Host a terminal command using a web server

[![Teleterminal Example Video](https://i.imgur.com/J7APEvS.png)](https://www.youtube.com/watch?v=cco1U_89R8M)

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

Options:                  Default   Description
-i, --interactive         none      Allow users to send keyboard input
                                    none | all | local
-m, --multi-session                 Start a new instance of the command for each connected user
-a, --allow-client-args             Allow the path and query dictate the command args (multi-session only)
-p, --port                3000      TCP port for the server to listen on
-h, --help                          Show this help screen
--history                 1000      Lines of command history to serve (single-session only)
--cols                    80        Number of terminal columns (single-session only)
--rows                    43        Number of terminal rows (single-session only)

Examples:
tt "ping something.com"
tt "ls" -i local -ma
```
