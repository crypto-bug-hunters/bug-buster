#!/bin/sh
./lua program.lua
status=$?
# Status is always 139 when program crashes with "Segmentation fault" (SIGSEGV)
if [ $status == 139 ]; then
    >&2 echo application crashed, exploit succeeded!
    exit 1
else
    >&2 echo application exited with status $status, exploit failed!
    exit 0
fi
