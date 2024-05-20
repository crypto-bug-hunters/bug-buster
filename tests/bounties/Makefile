all:
	$(MAKE) -C lua-bounty riscv64 VERSION=5.4.3
	$(MAKE) -C lua-bounty riscv64 VERSION=5.4.6

	$(MAKE) -C sqlite-bounty riscv64 VERSION=3.32.2
	$(MAKE) -C sqlite-bounty riscv64 VERSION=3.43.2

	$(MAKE) -C busybox-bounty riscv64 VERSION=1.36.1

	$(MAKE) -C solidity-bounty riscv64 VERSION=0.8.26

clean:
	$(MAKE) -C lua-bounty clean
	$(MAKE) -C sqlite-bounty clean
	$(MAKE) -C busybox-bounty clean
	$(MAKE) -C solidity-bounty clean

distclean:
	$(MAKE) -C lua-bounty distclean
	$(MAKE) -C sqlite-bounty distclean
	$(MAKE) -C busybox-bounty distclean
	$(MAKE) -C solidity-bounty distclean
