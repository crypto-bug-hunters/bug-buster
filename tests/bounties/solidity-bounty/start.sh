#!/bin/sh

#
# Validate exploit code - Exploit code file must contain only ascii characters
#
grep -q "[^[:print:]]" $1 
status=$?
if [ $status -ne 1 ]; then
    >&2 echo "Invalid exploit code: Error searching for non-ascii characters"
    exit 1
fi


#
# Validate exploit code - No experimental directives are allowed
# See: https://github.com/ethereum/solidity/issues/15223
#
grep -q "experimental" $1
status=$?
if [ $status -ne 1 ]; then
    >&2 echo "Invalid exploit code: Error searching for 'experimental' keyword"
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
