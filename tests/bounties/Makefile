all:
	$(MAKE) -C lua-bounty riscv64 VERSION=5.4.3
	$(MAKE) -C lua-bounty riscv64 VERSION=5.4.6

	$(MAKE) -C sqlite-bounty riscv64 VERSION=3.32.2
	$(MAKE) -C sqlite-bounty riscv64 VERSION=3.43.2

clean:
	$(MAKE) -C lua-bounty clean
	$(MAKE) -C sqlite-bounty clean

distclean:
	$(MAKE) -C lua-bounty distclean
	$(MAKE) -C sqlite-bounty distclean
