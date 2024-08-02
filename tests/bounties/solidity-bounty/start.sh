#!/bin/sh

#
# Validate exploit code - Exploit code file must contain only ascii characters
#
grep -q "[^[:print:]]" $1 
status=$?
if [ $status -eq 0 ]; then
    >&2 echo "Invalid exploit code: File contains non-ascii characters"
    exit 1
fi
if [ $status -eq 2 ]; then
    >&2 echo "Invalid exploit code: Error reading the file"
    exit 1
fi


#
# Validate exploit code - No experimental directives are allowed
#
grep -q "experimental" $1
status=$?
if [ $status -eq 0 ]; then
    >&2 echo "Invalid exploit code: contains 'experimental' keyword"
    exit 1
fi


#
# Validate exploit code - Requires specific version of Solidity
#
grep -q "pragma solidity 0.8.26" $1
status=$?
if [ $status -eq 1 ]; then
    >&2 echo "Invalid exploit code: pragma solidity 0.8.26 not found"
    exit 1
fi

#
# Run the exploit code
#
./solc $1
status=$?
# Status is always 139 when program crashes with "Segmentation fault" (SIGSEGV)
if [ $status -eq 139 ]; then
    >&2 echo application crashed, exploit succeeded!
    exit 0
else
    >&2 echo application exited with status $status, exploit failed!
    exit 1
fi
