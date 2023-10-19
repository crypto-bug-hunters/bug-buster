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

local config = {
    ETHER_PORTAL_ADDRESS = "0xffdbe43d4c855bf7e0f105c400a50857f53ab044",
    DAPP_ADDRESS_RELAY_ADDRESS = "0xf5de34d6bbc0446e2a45719e718efebaae179dae",
    DAPP_ADDRESS = "0x7122cd1221c20892234186facfe8615e6743ab02",
}

local machine_config = ".sunodo/image"
local machine_runtime_config = { skip_root_hash_check = true }
local machine_remote_protocol = "jsonrpc"

local CodecOpcodes = {
    BugLessState = 0x57896b8c,
    CreateAppBounty = 0x5792993c,
    AddSponsorship = 0x43032fa8,
    WithdrawSponsorship = 0x7e9de47b,
    SendExploit = 0xc2edf048,
    TestExploit = 0x18cc70af,
}

--------------------------------------------------------------------------------
-- Utilities

local function decode_response_jsons(res)
    for _, v in ipairs(res.reports) do
        local status = string.byte(v.payload:sub(1, 1))
        if status == 0 then -- log
            local text = v.payload:sub(2)
            res.error = (res.error or "") .. text
        elseif status == 1 then
            local opcode = string.unpack(">I4", v.payload:sub(2, 5))
            assert(opcode == CodecOpcodes.BugLessState, "unexpected bugless state")
            local body = v.payload:sub(6)
            res.state = fromjson(body)
        else
            error("unknown response status " .. status)
        end
    end
    if res.error then res.error = res.error:gsub("\n$", "") end
    res.reports = nil
    return res
end

local function advance_input(machine, opts)
    return decode_response_jsons(machine:advance_state({
        metadata = { msg_sender = fromhex(opts.sender), timestamp = opts.timestamp },
        payload = string.pack(">I4", opts.opcode) .. tojson(opts.data),
    }, true))
end

local function inspect_input(machine, opts)
    return decode_response_jsons(machine:inspect_state({
        payload = string.pack(">I4", opts.opcode) .. tojson(opts.data),
    }, true))
end

local function advance_ether_deposit(machine, opts)
    return decode_response_jsons(machine:advance_state({
        metadata = { msg_sender = fromhex(config.ETHER_PORTAL_ADDRESS), timestamp = opts.timestamp },
        payload = cartesix_encoder.encode_ether_deposit({
            sender_address = fromhex(opts.sender),
            amount = tobe256(opts.amount),
            extra_data = string.pack(">I4", opts.opcode) .. tojson(opts.data),
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

describe("tests on Lua bounty", function()
    local bounty_code = "tests/bounties/lua-bounty/lua-5.4.3-bounty_riscv64.tar.xz"
    local bounty_valid_exploit = readfile("tests/bounties/lua-bounty/exploit-lua-5.4.3.lua")
    local bounty_invalid_exploit = [[print 'hello world']]
    local bounty_index = 0
    local bounty_started = timestamp
    local bounty_deadline = bounty_started + 3600

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
            opcode = CodecOpcodes.CreateAppBounty,
            timestamp = timestamp,
            data = {
                Name = "Lua 5.4.3 Bounty",
                Description = "Try to crash a sandboxed Lua 5.4.3 script",
                Deadline = bounty_deadline,
                CodeZipBinary = tobase64(readfile(bounty_code)),
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            Bounties = {
                {
                    Developer = {
                        Address = DEVELOPER1_WALLET,
                        ImgLink = "",
                        Name = "Lua 5.4.3 Bounty",
                    },
                    Deadline = bounty_deadline,
                    Description = "Try to crash a sandboxed Lua 5.4.3 script",
                    Exploit = null,
                    InputIndex = 1,
                    Sponsorships = null,
                    Started = bounty_started,
                    Withdrawn = false,
                },
            },
        })
    end)

    it("should add sponsorship from developer itself", function()
        local res = advance_ether_deposit(machine, {
            sender = DEVELOPER1_WALLET,
            amount = 1000,
            opcode = CodecOpcodes.AddSponsorship,
            timestamp = timestamp,
            data = {
                Name = "Developer1",
                BountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            Bounties = {
                {
                    Developer = {
                        Address = DEVELOPER1_WALLET,
                        ImgLink = "",
                        Name = "Lua 5.4.3 Bounty",
                    },
                    Deadline = bounty_deadline,
                    Description = "Try to crash a sandboxed Lua 5.4.3 script",
                    Exploit = null,
                    InputIndex = 1,
                    Sponsorships = {
                        {
                            Sponsor = {
                                Address = DEVELOPER1_WALLET,
                                ImgLink = "",
                                Name = "Developer1",
                            },
                            Value = tohex(1000),
                        },
                    },
                    Started = bounty_started,
                    Withdrawn = false,
                },
            },
        })
    end)

    it("should add sponsorship from an external sponsor", function()
        local res = advance_ether_deposit(machine, {
            sender = SPONSOR1_WALLET,
            amount = 2000,
            opcode = CodecOpcodes.AddSponsorship,
            timestamp = timestamp,
            data = {
                Name = "Sponsor1",
                BountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            Bounties = {
                {
                    Developer = {
                        Address = DEVELOPER1_WALLET,
                        ImgLink = "",
                        Name = "Lua 5.4.3 Bounty",
                    },
                    Deadline = bounty_deadline,
                    Description = "Try to crash a sandboxed Lua 5.4.3 script",
                    Exploit = null,
                    InputIndex = 1,
                    Sponsorships = {
                        {
                            Sponsor = {
                                Address = DEVELOPER1_WALLET,
                                ImgLink = "",
                                Name = "Developer1",
                            },
                            Value = tohex(1000),
                        },
                        {
                            Sponsor = {
                                Address = SPONSOR1_WALLET,
                                ImgLink = "",
                                Name = "Sponsor1",
                            },
                            Value = tohex(2000),
                        },
                    },
                    Started = bounty_started,
                    Withdrawn = false,
                },
            },
        })
    end)

    -- advance to just before deadline
    timestamp = bounty_deadline - 1

    it("should reject sponsor withdraw for an invalid bounty", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            opcode = CodecOpcodes.WithdrawSponsorship,
            timestamp = timestamp,
            data = {
                BountyIndex = 9999,
            },
        })
        expect.equal(res.status, "rejected")
        expect.equal(res.error, "rejecting: bounty not found")
    end)

    it("should reject sponsor withdraw before deadline", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            opcode = CodecOpcodes.WithdrawSponsorship,
            timestamp = timestamp,
            data = {
                BountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "rejected")
        expect.equal(res.error, "rejecting: can't withdraw before deadline")
    end)

    it("should accept inspect of a exploit that succeeded", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            opcode = CodecOpcodes.TestExploit,
            timestamp = timestamp,
            data = {
                BountyIndex = bounty_index,
                Exploit = tobase64(bounty_valid_exploit),
            },
        })
        expect.equal(res.status, "accepted")
    end)

    it("should reject inspect of a exploit that failed", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            opcode = CodecOpcodes.TestExploit,
            timestamp = timestamp,
            data = {
                Name = "Hacker1",
                BountyIndex = bounty_index,
                Exploit = tobase64(bounty_invalid_exploit),
            },
        })
        expect.equal(res.status, "rejected")
    end)

    -- advance to bounty_deadline
    timestamp = bounty_deadline

    it("should accept withdraw after deadline", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            opcode = CodecOpcodes.WithdrawSponsorship,
            timestamp = timestamp,
            data = {
                BountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            Bounties = {
                {
                    Developer = {
                        Address = DEVELOPER1_WALLET,
                        ImgLink = "",
                        Name = "Lua 5.4.3 Bounty",
                    },
                    Deadline = bounty_deadline,
                    Description = "Try to crash a sandboxed Lua 5.4.3 script",
                    Exploit = null,
                    InputIndex = 1,
                    Sponsorships = {
                        {
                            Sponsor = {
                                Address = DEVELOPER1_WALLET,
                                ImgLink = "",
                                Name = "Developer1",
                            },
                            Value = tohex(1000),
                        },
                        {
                            Sponsor = {
                                Address = SPONSOR1_WALLET,
                                ImgLink = "",
                                Name = "Sponsor1",
                            },
                            Value = tohex(2000),
                        },
                    },
                    Started = bounty_started,
                    Withdrawn = true,
                },
            },
        })
        expect.equal(res.vouchers, {
            {
                address = fromhex(config.DAPP_ADDRESS),
                payload = cartesix_encoder.encode_ether_transfer_voucher({
                    destination_address = DEVELOPER1_WALLET,
                    amount = tobe256(1000),
                }),
            },
            {
                address = fromhex(config.DAPP_ADDRESS),
                payload = cartesix_encoder.encode_ether_transfer_voucher({
                    destination_address = SPONSOR1_WALLET,
                    amount = tobe256(2000),
                }),
            },
        })
        first_bounty_final_state = res.state.Bounties[bounty_index + 1]
    end)

    it("should reject double withdraw", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            opcode = CodecOpcodes.WithdrawSponsorship,
            timestamp = timestamp,
            data = {
                BountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "rejected")
        expect.equal(res.error, "rejecting: sponsorships already withdrawn")
    end)

    it("should reject exploit after deadline", function()
        local res = advance_input(machine, {
            sender = HACKER1_WALLET,
            opcode = CodecOpcodes.SendExploit,
            timestamp = timestamp,
            data = {
                Name = "Hacker1",
                BountyIndex = bounty_index,
                Exploit = tobase64(bounty_valid_exploit),
            },
        })
        expect.equal(res.status, "rejected")
        expect.equal(res.error, "rejecting: can't run exploit after deadline")
    end)

    it("should reject sponsorship after deadline", function()
        local res = advance_ether_deposit(machine, {
            sender = SPONSOR1_WALLET,
            amount = 1000,
            opcode = CodecOpcodes.AddSponsorship,
            timestamp = timestamp,
            data = {
                Name = "Sponsor1",
                BountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "rejected")
        expect.equal(res.error, "rejecting: can't add sponsorship after deadline")
    end)

    it("should reject inspect of a bounty that consumes too much RAM", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            opcode = CodecOpcodes.TestExploit,
            timestamp = timestamp,
            data = {
                Name = "Hacker1",
                BountyIndex = bounty_index,
                Exploit = tobase64([[s=string.rep('x',4096) while true do s=s..s end]]),
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should reject inspect of a bounty that consumes too much disk", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            opcode = CodecOpcodes.TestExploit,
            timestamp = timestamp,
            data = {
                Name = "Hacker1",
                BountyIndex = bounty_index,
                Exploit = tobase64([[
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
            opcode = CodecOpcodes.TestExploit,
            timestamp = timestamp,
            data = {
                Name = "Hacker1",
                BountyIndex = bounty_index,
                Exploit = tobase64([[while true do end]]),
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should reject inspect of a bounty that waits IO for too long", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            opcode = CodecOpcodes.TestExploit,
            timestamp = timestamp,
            data = {
                Name = "Hacker1",
                BountyIndex = bounty_index,
                Exploit = tobase64([[io.stdin:read('a')]]),
            },
        })
        expect.equal(res.status, "rejected")
    end)
end)

describe("tests on SQLite bounty", function()
    local sqlite33202_bounty_code = "tests/bounties/sqlite-bounty/sqlite-3.32.2-bounty_riscv64.tar.xz"
    local bounty_valid_exploit = readfile("tests/bounties/sqlite-bounty/exploit-sqlite-3.32.2.sql")
    local bounty_index = 1
    local bounty_started = timestamp
    local bounty_deadline = timestamp + 7200

    it("should create bounty", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            opcode = CodecOpcodes.CreateAppBounty,
            timestamp = timestamp,
            data = {
                Name = "SQLite3 3.32.2 Bounty",
                Description = "Try to crash SQLite 3.32.2 with a SQL query",
                Deadline = bounty_deadline,
                CodeZipBinary = tobase64(readfile(sqlite33202_bounty_code)),
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            Bounties = {
                first_bounty_final_state,
                {
                    Developer = {
                        Address = DEVELOPER1_WALLET,
                        ImgLink = "",
                        Name = "SQLite3 3.32.2 Bounty",
                    },
                    Deadline = bounty_deadline,
                    Description = "Try to crash SQLite 3.32.2 with a SQL query",
                    Exploit = null,
                    InputIndex = 5,
                    Sponsorships = null,
                    Started = bounty_started,
                    Withdrawn = false,
                },
            },
        })
    end)

    it("should add sponsorship from an external sponsor", function()
        local res = advance_ether_deposit(machine, {
            sender = SPONSOR1_WALLET,
            amount = 4000,
            opcode = CodecOpcodes.AddSponsorship,
            timestamp = timestamp,
            data = {
                Name = "Sponsor1 Old Name",
                BountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            Bounties = {
                first_bounty_final_state,
                {
                    Developer = {
                        Address = DEVELOPER1_WALLET,
                        ImgLink = "",
                        Name = "SQLite3 3.32.2 Bounty",
                    },
                    Deadline = bounty_deadline,
                    Description = "Try to crash SQLite 3.32.2 with a SQL query",
                    Exploit = null,
                    InputIndex = 5,
                    Sponsorships = {
                        {
                            Sponsor = {
                                Address = SPONSOR1_WALLET,
                                ImgLink = "",
                                Name = "Sponsor1 Old Name",
                            },
                            Value = tohex(4000),
                        },
                    },
                    Started = bounty_started,
                    Withdrawn = false,
                },
            },
        })
    end)

    it("should raise an sponsorship", function()
        local res = advance_ether_deposit(machine, {
            sender = SPONSOR1_WALLET,
            amount = 5000,
            opcode = CodecOpcodes.AddSponsorship,
            timestamp = timestamp,
            data = {
                Name = "Sponsor1",
                BountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            Bounties = {
                first_bounty_final_state,
                {
                    Developer = {
                        Address = DEVELOPER1_WALLET,
                        ImgLink = "",
                        Name = "SQLite3 3.32.2 Bounty",
                    },
                    Deadline = bounty_deadline,
                    Description = "Try to crash SQLite 3.32.2 with a SQL query",
                    Exploit = null,
                    InputIndex = 5,
                    Sponsorships = {
                        {
                            Sponsor = {
                                Address = SPONSOR1_WALLET,
                                ImgLink = "",
                                Name = "Sponsor1",
                            },
                            Value = tohex(9000),
                        },
                    },
                    Started = bounty_started,
                    Withdrawn = false,
                },
            },
        })
    end)

    timestamp = timestamp + 1

    it("should accept an exploit that succeeded", function()
        local res = advance_input(machine, {
            sender = HACKER1_WALLET,
            opcode = CodecOpcodes.SendExploit,
            timestamp = timestamp,
            data = {
                Name = "Hacker1",
                BountyIndex = bounty_index,
                Exploit = tobase64(bounty_valid_exploit),
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            Bounties = {
                first_bounty_final_state,
                {
                    Developer = {
                        Address = DEVELOPER1_WALLET,
                        ImgLink = "",
                        Name = "SQLite3 3.32.2 Bounty",
                    },
                    Deadline = bounty_deadline,
                    Description = "Try to crash SQLite 3.32.2 with a SQL query",
                    Exploit = {
                        InputIndex = 8,
                        Hacker = {
                            Address = HACKER1_WALLET,
                            ImgLink = "",
                            Name = "Hacker1",
                        },
                    },
                    InputIndex = 5,
                    Sponsorships = {
                        {
                            Sponsor = {
                                Address = SPONSOR1_WALLET,
                                ImgLink = "",
                                Name = "Sponsor1",
                            },
                            Value = tohex(9000),
                        },
                    },
                    Started = bounty_started,
                    Withdrawn = true,
                },
            },
        })
        expect.equal(res.vouchers, {
            {
                address = fromhex(config.DAPP_ADDRESS),
                payload = cartesix_encoder.encode_ether_transfer_voucher({
                    destination_address = HACKER1_WALLET,
                    amount = tobe256(9000),
                }),
            },
        })
    end)

    it("should reject a valid exploit after a previous exploit succeeded", function()
        local res = advance_input(machine, {
            sender = HACKER2_WALLET,
            opcode = CodecOpcodes.SendExploit,
            timestamp = timestamp,
            data = {
                Name = "Hacker2",
                BountyIndex = bounty_index,
                Exploit = tobase64(bounty_valid_exploit),
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should reject withdraw after a previous exploit succeeded", function()
        local res = advance_input(machine, {
            sender = SPONSOR1_WALLET,
            opcode = CodecOpcodes.WithdrawSponsorship,
            timestamp = timestamp,
            data = {
                BountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "rejected")
        expect.equal(res.error, "rejecting: can't withdraw because exploit was found")
    end)

    it("should reject sponsorship after a previous exploit succeeded", function()
        local res = advance_ether_deposit(machine, {
            sender = SPONSOR1_WALLET,
            amount = 1000,
            opcode = CodecOpcodes.AddSponsorship,
            timestamp = timestamp,
            data = {
                Name = "Sponsor1",
                BountyIndex = bounty_index,
            },
        })
        expect.equal(res.status, "rejected")
        expect.equal(res.error, "rejecting: can't add sponsorship because exploit was found")
    end)
end)

lester.report() -- Print overall statistic of the tests run.
lester.exit() -- Exit with success if all tests passed.
