#!/bin/sh

# exit when command fails
set -e

# create bounty file tree
rm -rf /var/tmp/bounty-tree
mkdir -p /var/tmp/bounty-tree

# extract bounty files
cd /var/tmp/bounty-tree
tar xf $1 --warning=no-timestamp

# run bounty test
./start.sh /var/tmp/exploit
status=$?

# delete bounty files
rm -rf /var/tmp/bounty-tree

exit $status
