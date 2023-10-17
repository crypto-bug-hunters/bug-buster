#!/bin/sh
cd exploit
coproc ./exploit-start.sh
cd ../program
./program-start.sh <&${COPROC[0]} >&${COPROC[1]}
