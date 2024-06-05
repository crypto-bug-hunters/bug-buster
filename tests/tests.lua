local cartesix_rolling_machine = require("cartesix.rollingmachine")
local cartesix_encoder = require("cartesix.encoder")
local cjson = require("cjson") -- json
local luazen = require("luazen") -- base64
local lester = require("lester") -- unit testing

local fromhex, tohex, tobe256 = cartesix_encoder.fromhex, cartesix_encoder.tohex, cartesix_encoder.encode_be256
local tojson, fromjson, null = cjson.encode, cjson.decode, cjson.null
local tobase64 = luazen.b64encode
local describe, it, expect = lester.describe, lester.it, lester.expect

--------------------------------------------------------------------------------
-- Configurations

-- Uncomment to stop when first test fail
lester.stop_on_fail = true

local DEVELOPER1_WALLET = "0x0000000000000000000000000000000000000001"
local SPONSOR1_WALLET = "0x0000000000000000000000000000000000000101"
local HACKER1_WALLET = "0x0000000000000000000000000000000000000201"
local HACKER2_WALLET = "0x0000000000000000000000000000000000000202"

local CTSI_ADDRESS = "0x491604c0fdf08347dd1fa4ee062a822a5dd06b5d"
local USDC_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
local WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

local config = {
    ERC20_PORTAL_ADDRESS = "0x9c21aeb2093c32ddbc53eef24b873bdcd1ada1db",
    DAPP_ADDRESS_RELAY_ADDRESS = "0xf5de34d6bbc0446e2a45719e718efebaae179dae",
    DAPP_ADDRESS = "0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e",
}

local machine_config = ".cartesi/image"
local machine_runtime_config = { skip_root_hash_check = true }
local machine_remote_protocol = "jsonrpc"

--------------------------------------------------------------------------------
-- Utilities

local function decode_response_jsons(res)
    for _, v in ipairs(res.reports) do
        local body = v.payload
        local ok, state = pcall(fromjson, body)
        if ok then
            res.state = state
        end
    end
    res.reports = nil
    return res
end

local function advance_input(machine, opts)
    return decode_response_jsons(machine:advance_state({
        metadata = { msg_sender = fromhex(opts.sender), timestamp = opts.timestamp },
        payload = tojson{ kind = opts.kind, payload = opts.data },
    }, true))
end

local function inspect_input(machine, opts)
    return decode_response_jsons(machine:inspect_state({
        payload = tojson(opts.data),
    }, true))
end

local function advance_erc20_deposit(machine, opts)
    return decode_response_jsons(machine:advance_state({
        metadata = { msg_sender = fromhex(config.ERC20_PORTAL_ADDRESS), timestamp = opts.timestamp },
        payload = cartesix_encoder.encode_erc20_deposit({
            contract_address = fromhex(opts.token),
            sender_address = fromhex(opts.sender),
            amount = tobe256(opts.amount),
            extra_data = tojson{ kind = opts.kind, payload = opts.data },
        }),
    }, true))
end

local function readfile(file)
    local f = assert(io.open(file, "rb"))
    local contents = assert(f:read("a"))
    f:close()
    return contents
end

--------------------------------------------------------------------------------
-- Tests

local machine <close> = cartesix_rolling_machine(machine_config, machine_runtime_config, machine_remote_protocol)
machine:run_until_yield_or_halt()

local timestamp = 1697567000
local first_bounty_final_state
local second_bounty_final_state
local third_bounty_final_state

describe("tests on Lua bounty", function()
    local bounty_code = "tests/bounties/lua-bounty/lua-5.4.3-bounty_riscv64.tar.xz"
    local bounty_valid_exploit = readfile("tests/bounties/lua-bounty/exploit-lua-5.4.3.lua")
    local bounty_invalid_exploit = [[print 'hello world']]
    local bounty_index = 0
    local bounty_deadline = timestamp + 3600

    it("should relay dapp address", function()
        local res = machine:advance_state({
            metadata = {
                msg_sender = fromhex(config.DAPP_ADDRESS_RELAY_ADDRESS),
                timestamp = timestamp,
            },
            payload = fromhex(config.DAPP_ADDRESS),
        }, true)
        expect.equal(res.status, "accepted")
    end)

    it("should create bounty", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            kind = "CreateAppBounty",
            timestamp = timestamp,
            data = {
                name = "Lua 5.4.3 Bounty",
                description = "Try to crash a sandboxed Lua 5.4.3 script",
                deadline = bounty_deadline,
                token = CTSI_ADDRESS,
                codeZipBinary = tobase64(readfile(bounty_code)),
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            bounties = {
                {
                    deadline = bounty_deadline,
                    description = "Try to crash a sandboxed Lua 5.4.3 script",
                    exploit = null,
                    imgLink = "",
                    name = "Lua 5.4.3 Bounty",
                    sponsorships = null,
                    token = CTSI_ADDRESS,
                    withdrawn = false,
                },
            },
        })
    end)

    it("should add sponsorship from developer itself", function()
        local res = advance_erc20_deposit(machine, {
            token = CTSI_ADDRESS,
            sender = DEVELOPER1_WALLET,
            amount = 1000,
            kind = "AddSponsorship",
            timestamp = timestamp,
            data = {
                name = "Developer1",
                bountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            bounties = {
                {
                    deadline = bounty_deadline,
                    description = "Try to crash a sandboxed Lua 5.4.3 script",
                    exploit = null,
                    imgLink = "",
                    name = "Lua 5.4.3 Bounty",
                    sponsorships = {
                        {
                            sponsor = {
                                address = DEVELOPER1_WALLET,
                                imgLink = "",
                                name = "Developer1",
                            },
                            value = "1000",
                        },
                    },
                    token = CTSI_ADDRESS,
                    withdrawn = false,
                },
            },
        })
    end)

    it("should add sponsorship from an external sponsor", function()
        local res = advance_erc20_deposit(machine, {
            token = CTSI_ADDRESS,
            sender = SPONSOR1_WALLET,
            amount = 2000,
            kind = "AddSponsorship",
            timestamp = timestamp,
            data = {
                name = "Sponsor1",
                bountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            bounties = {
                {
                    deadline = bounty_deadline,
                    description = "Try to crash a sandboxed Lua 5.4.3 script",
                    exploit = null,
                    imgLink = "",
                    name = "Lua 5.4.3 Bounty",
                    sponsorships = {
                        {
                            sponsor = {
                                address = DEVELOPER1_WALLET,
                                imgLink = "",
                                name = "Developer1",
                            },
                            value = "1000",
                        },
                        {
                            sponsor = {
                                address = SPONSOR1_WALLET,
                                imgLink = "",
                                name = "Sponsor1",
                            },
                            value = "2000",
                        },
                    },
                    token = CTSI_ADDRESS,
                    withdrawn = false,
                },
            },
        })
    end)

    -- advance to just before deadline
    timestamp = bounty_deadline - 1

    it("should reject sponsor withdraw for an invalid bounty", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            kind = "WithdrawSponsorship",
            timestamp = timestamp,
            data = {
                bountyIndex = 9999,
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should reject sponsorship with the wrong token", function()
        local res = advance_erc20_deposit(machine, {
            token = USDC_ADDRESS,
            sender = DEVELOPER1_WALLET,
            amount = 1000,
            kind = "AddSponsorship",
            timestamp = timestamp,
            data = {
                name = "Developer1",
                bountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should reject sponsor withdraw before deadline", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            kind = "WithdrawSponsorship",
            timestamp = timestamp,
            data = {
                bountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should accept inspect of a exploit that succeeded", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            timestamp = timestamp,
            data = {
                bountyIndex = bounty_index,
                exploit = tobase64(bounty_valid_exploit),
            },
        })
        expect.equal(res.status, "accepted")
    end)

    it("should reject inspect of a exploit that failed", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            timestamp = timestamp,
            data = {
                name = "Hacker1",
                bountyIndex = bounty_index,
                exploit = tobase64(bounty_invalid_exploit),
            },
        })
        expect.equal(res.status, "rejected")
    end)

    -- advance to bounty_deadline
    timestamp = bounty_deadline

    it("should accept withdraw after deadline", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            kind = "WithdrawSponsorship",
            timestamp = timestamp,
            data = {
                bountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            bounties = {
                {
                    deadline = bounty_deadline,
                    description = "Try to crash a sandboxed Lua 5.4.3 script",
                    exploit = null,
                    imgLink = "",
                    name = "Lua 5.4.3 Bounty",
                    sponsorships = {
                        {
                            sponsor = {
                                address = DEVELOPER1_WALLET,
                                imgLink = "",
                                name = "Developer1",
                            },
                            value = "1000",
                        },
                        {
                            sponsor = {
                                address = SPONSOR1_WALLET,
                                imgLink = "",
                                name = "Sponsor1",
                            },
                            value = "2000",
                        },
                    },
                    token = CTSI_ADDRESS,
                    withdrawn = true,
                },
            },
        })
        expect.equal(res.vouchers, {
            {
                address = fromhex(CTSI_ADDRESS),
                payload = cartesix_encoder.encode_erc20_transfer_voucher({
                    destination_address = DEVELOPER1_WALLET,
                    amount = tobe256(1000),
                }),
            },
            {
                address = fromhex(CTSI_ADDRESS),
                payload = cartesix_encoder.encode_erc20_transfer_voucher({
                    destination_address = SPONSOR1_WALLET,
                    amount = tobe256(2000),
                }),
            },
        })
        first_bounty_final_state = res.state.bounties[bounty_index + 1]
    end)

    it("should reject double withdraw", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            kind = "WithdrawSponsorship",
            timestamp = timestamp,
            data = {
                bountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should reject exploit after deadline", function()
        local res = advance_input(machine, {
            sender = HACKER1_WALLET,
            kind = "SendExploit",
            timestamp = timestamp,
            data = {
                name = "Hacker1",
                bountyIndex = bounty_index,
                exploit = tobase64(bounty_valid_exploit),
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should reject sponsorship after deadline", function()
        local res = advance_erc20_deposit(machine, {
            token = CTSI_ADDRESS,
            sender = SPONSOR1_WALLET,
            amount = 1000,
            kind = "AddSponsorship",
            timestamp = timestamp,
            data = {
                name = "Sponsor1",
                bountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should reject inspect of a bounty that consumes too much RAM", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            timestamp = timestamp,
            data = {
                name = "Hacker1",
                bountyIndex = bounty_index,
                exploit = tobase64([[s=string.rep('x',4096) while true do s=s..s end]]),
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should reject inspect of a bounty that consumes too much disk", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            timestamp = timestamp,
            data = {
                name = "Hacker1",
                bountyIndex = bounty_index,
                exploit = tobase64([[
s=string.rep('x',4096)
f=assert(io.open('/tmp/test', 'wb'))
while true do
    s=s..s
    assert(f:write(s))
    assert(f:flush())
end
]]),
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should reject inspect of a bounty that consumes too much CPU", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            timestamp = timestamp,
            data = {
                name = "Hacker1",
                bountyIndex = bounty_index,
                exploit = tobase64([[while true do end]]),
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should reject inspect of a bounty that waits IO for too long", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            timestamp = timestamp,
            data = {
                name = "Hacker1",
                bountyIndex = bounty_index,
                exploit = tobase64([[io.stdin:read('a')]]),
            },
        })
        expect.equal(res.status, "rejected")
    end)
end)

describe("tests on SQLite bounty", function()
    local sqlite33202_bounty_code = "tests/bounties/sqlite-bounty/sqlite-3.32.2-bounty_riscv64.tar.xz"
    local bounty_valid_exploit = readfile("tests/bounties/sqlite-bounty/exploit-sqlite-3.32.2.sql")
    local bounty_index = 1
    local bounty_deadline = timestamp + 7200

    it("should create bounty", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            kind = "CreateAppBounty",
            timestamp = timestamp,
            data = {
                name = "SQLite3 3.32.2 Bounty",
                description = "Try to crash SQLite 3.32.2 with a SQL query",
                deadline = bounty_deadline,
                token = WETH_ADDRESS,
                codeZipBinary = tobase64(readfile(sqlite33202_bounty_code)),
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            bounties = {
                first_bounty_final_state,
                {
                    deadline = bounty_deadline,
                    description = "Try to crash SQLite 3.32.2 with a SQL query",
                    exploit = null,
                    imgLink = "",
                    name = "SQLite3 3.32.2 Bounty",
                    sponsorships = null,
                    token = WETH_ADDRESS,
                    withdrawn = false,
                },
            },
        })
    end)

    it("should add sponsorship from an external sponsor", function()
        local res = advance_erc20_deposit(machine, {
            token = WETH_ADDRESS,
            sender = SPONSOR1_WALLET,
            amount = 4000,
            kind = "AddSponsorship",
            timestamp = timestamp,
            data = {
                name = "Sponsor1 Old name",
                bountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            bounties = {
                first_bounty_final_state,
                {
                    deadline = bounty_deadline,
                    description = "Try to crash SQLite 3.32.2 with a SQL query",
                    exploit = null,
                    imgLink = "",
                    name = "SQLite3 3.32.2 Bounty",
                    sponsorships = {
                        {
                            sponsor = {
                                address = SPONSOR1_WALLET,
                                imgLink = "",
                                name = "Sponsor1 Old name",
                            },
                            value = "4000",
                        },
                    },
                    token = WETH_ADDRESS,
                    withdrawn = false,
                },
            },
        })
    end)

    it("should raise an sponsorship", function()
        local res = advance_erc20_deposit(machine, {
            token = WETH_ADDRESS,
            sender = SPONSOR1_WALLET,
            amount = 5000,
            kind = "AddSponsorship",
            timestamp = timestamp,
            data = {
                name = "Sponsor1",
                bountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            bounties = {
                first_bounty_final_state,
                {
                    deadline = bounty_deadline,
                    description = "Try to crash SQLite 3.32.2 with a SQL query",
                    exploit = null,
                    imgLink = "",
                    name = "SQLite3 3.32.2 Bounty",
                    sponsorships = {
                        {
                            sponsor = {
                                address = SPONSOR1_WALLET,
                                imgLink = "",
                                name = "Sponsor1",
                            },
                            value = "9000",
                        },
                    },
                    token = WETH_ADDRESS,
                    withdrawn = false,
                },
            },
        })
    end)

    timestamp = timestamp + 1

    it("should accept an exploit that succeeded", function()
        local res = advance_input(machine, {
            sender = HACKER1_WALLET,
            kind = "SendExploit",
            timestamp = timestamp,
            data = {
                name = "Hacker1",
                bountyIndex = bounty_index,
                exploit = tobase64(bounty_valid_exploit),
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            bounties = {
                first_bounty_final_state,
                {
                    deadline = bounty_deadline,
                    description = "Try to crash SQLite 3.32.2 with a SQL query",
                    exploit = {
                        inputIndex = 8,
                        hacker = {
                            address = HACKER1_WALLET,
                            imgLink = "",
                            name = "Hacker1",
                        },
                    },
                    imgLink = "",
                    name = "SQLite3 3.32.2 Bounty",
                    sponsorships = {
                        {
                            sponsor = {
                                address = SPONSOR1_WALLET,
                                imgLink = "",
                                name = "Sponsor1",
                            },
                            value = "9000",
                        },
                    },
                    token = WETH_ADDRESS,
                    withdrawn = true,
                },
            },
        })
        second_bounty_final_state = res.state.bounties[bounty_index + 1]
        expect.equal(res.vouchers, {
            {
                address = fromhex(WETH_ADDRESS),
                payload = cartesix_encoder.encode_erc20_transfer_voucher({
                    destination_address = HACKER1_WALLET,
                    amount = tobe256(9000),
                }),
            },
        })
    end)

    it("should reject a valid exploit after a previous exploit succeeded", function()
        local res = advance_input(machine, {
            sender = HACKER2_WALLET,
            kind = "SendExploit",
            timestamp = timestamp,
            data = {
                name = "Hacker2",
                bountyIndex = bounty_index,
                exploit = tobase64(bounty_valid_exploit),
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should reject withdraw after a previous exploit succeeded", function()
        local res = advance_input(machine, {
            sender = SPONSOR1_WALLET,
            kind = "WithdrawSponsorship",
            timestamp = timestamp,
            data = {
                bountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should reject sponsorship after a previous exploit succeeded", function()
        local res = advance_erc20_deposit(machine, {
            token = WETH_ADDRESS,
            sender = SPONSOR1_WALLET,
            amount = 1000,
            kind = "AddSponsorship",
            timestamp = timestamp,
            data = {
                name = "Sponsor1",
                bountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "rejected")
    end)
end)

describe("tests on BusyBox bounty", function()
    local sqlite33202_bounty_code = "tests/bounties/busybox-bounty/busybox-1.36.1-bounty_riscv64.tar.xz"
    local bounty_valid_exploit = readfile("tests/bounties/busybox-bounty/exploit-busybox-1.36.1.sh")
    local bounty_index = 2
    local bounty_deadline = timestamp + 7200

    it("should create bounty", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            kind = "CreateAppBounty",
            timestamp = timestamp,
            data = {
                name = "BusyBox 1.36.1 Bounty",
                description = "Try to crash BusyBox 1.36.1",
                deadline = bounty_deadline,
                token = USDC_ADDRESS,
                codeZipBinary = tobase64(readfile(sqlite33202_bounty_code)),
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            bounties = {
                first_bounty_final_state,
                second_bounty_final_state,
                {
                    deadline = bounty_deadline,
                    description = "Try to crash BusyBox 1.36.1",
                    exploit = null,
                    imgLink = "",
                    name = "BusyBox 1.36.1 Bounty",
                    sponsorships = null,
                    token = USDC_ADDRESS,
                    withdrawn = false,
                },
            },
        })
    end)

    timestamp = timestamp + 1

    it("should accept an exploit that succeeded", function()
        local res = advance_input(machine, {
            sender = HACKER1_WALLET,
            kind = "SendExploit",
            timestamp = timestamp,
            data = {
                name = "Hacker1",
                bountyIndex = bounty_index,
                exploit = tobase64(bounty_valid_exploit),
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            bounties = {
                first_bounty_final_state,
                second_bounty_final_state,
                {
                    deadline = bounty_deadline,
                    description = "Try to crash BusyBox 1.36.1",
                    exploit = {
                        inputIndex = 10,
                        hacker = {
                            address = HACKER1_WALLET,
                            imgLink = "",
                            name = "Hacker1",
                        },
                    },
                    imgLink = "",
                    name = "BusyBox 1.36.1 Bounty",
                    sponsorships = null,
                    token = USDC_ADDRESS,
                    withdrawn = true,
                },
            },
        })
        third_bounty_final_state = res.state.bounties[bounty_index + 1]
        expect.equal(res.vouchers, {
            {
                address = fromhex(USDC_ADDRESS),
                payload = cartesix_encoder.encode_erc20_transfer_voucher({
                    destination_address = HACKER1_WALLET,
                    amount = tobe256(0),
                }),
            },
        })
    end)
end)

describe("tests on (linked) Lua bounty", function()
    local bounty_path = "/bounties/0.tar.xz"
    local bounty_valid_exploit = readfile("tests/bounties/lua-bounty/exploit-lua-5.4.3.lua")
    local bounty_invalid_exploit = [[print 'hello world']]
    local bounty_index = 3
    local bounty_deadline = timestamp + 3600

    it("should create bounty from built-in file", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            kind = "CreateAppBounty",
            timestamp = timestamp,
            data = {
                name = "Lua 5.4.3 Bounty (linked)",
                description = "Try to crash a sandboxed Lua 5.4.3 script, again!",
                deadline = bounty_deadline,
                token = WETH_ADDRESS,
                codeZipPath = bounty_path,
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            bounties = {
                first_bounty_final_state,
                second_bounty_final_state,
                third_bounty_final_state,
                {
                    deadline = bounty_deadline,
                    description = "Try to crash a sandboxed Lua 5.4.3 script, again!",
                    exploit = null,
                    imgLink = "",
                    name = "Lua 5.4.3 Bounty (linked)",
                    sponsorships = null,
                    token = WETH_ADDRESS,
                    withdrawn = false,
                },
            },
        })
    end)

    -- advance to just before deadline
    timestamp = bounty_deadline - 1

    it("should accept inspect of a exploit that succeeded", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            timestamp = timestamp,
            data = {
                bountyIndex = bounty_index,
                exploit = tobase64(bounty_valid_exploit),
            },
        })
        expect.equal(res.status, "accepted")
    end)

    it("should reject inspect of a exploit that failed", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            timestamp = timestamp,
            data = {
                name = "Hacker1",
                bountyIndex = bounty_index,
                exploit = tobase64(bounty_invalid_exploit),
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should reject inspect of a bounty that consumes too much RAM", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            timestamp = timestamp,
            data = {
                name = "Hacker1",
                bountyIndex = bounty_index,
                exploit = tobase64([[s=string.rep('x',4096) while true do s=s..s end]]),
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should reject inspect of a bounty that consumes too much disk", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            timestamp = timestamp,
            data = {
                name = "Hacker1",
                bountyIndex = bounty_index,
                exploit = tobase64([[
s=string.rep('x',4096)
f=assert(io.open('/tmp/test', 'wb'))
while true do
    s=s..s
    assert(f:write(s))
    assert(f:flush())
end
]]),
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should reject inspect of a bounty that consumes too much CPU", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            timestamp = timestamp,
            data = {
                name = "Hacker1",
                bountyIndex = bounty_index,
                exploit = tobase64([[while true do end]]),
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should reject inspect of a bounty that waits IO for too long", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            timestamp = timestamp,
            data = {
                name = "Hacker1",
                bountyIndex = bounty_index,
                exploit = tobase64([[io.stdin:read('a')]]),
            },
        })
        expect.equal(res.status, "rejected")
    end)
end)

lester.report() -- Print overall statistic of the tests run.
lester.exit() -- Exit with success if all tests passed.
