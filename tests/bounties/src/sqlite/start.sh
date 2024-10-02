#!/usr/bin/env bash
source aliases.sh
rm -f /tmp/test.db
# -safe was introduced only in recent versions
if sqlite3 -safe </dev/null 2>/dev/null; then
    sqlite3 -safe /tmp/test.db <$1
else
    sqlite3 /tmp/test.db <$1
fi
status=$?
rm -f /tmp/test.db
# Status is always 139 when program crashes with "Segmentation fault" (SIGSEGV)
if [ $status -eq 139 ]; then
    >&2 echo application crashed, exploit succeeded!
    exit 0
else
    >&2 echo application exited with status $status, exploit failed!
    exit 1
fi
