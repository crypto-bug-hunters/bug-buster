local cartesix_rolling_machine = require("cartesix.rollingmachine")
local cartesix_encoder = require("cartesix.encoder")
local lester = require("lester")
local fromhex, tohex = cartesix_encoder.fromhex, cartesix_encoder.tohex
local int256 = require("bint")(256)
local describe, it, expect = lester.describe, lester.it, lester.expect
local null = require("cjson").null
local json_encode = require("cjson").encode
local json_decode = require("cjson").decode
local base64_encode = require("luazen").b64encode

--------------------------------------------------------------------------------
-- Configurations

-- Uncomment to stop when first test fail
lester.stop_on_fail = true

local DEVELOPER1_WALLET = ("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"):lower()
local SPONSOR1_WALLET = ("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92268"):lower()
local HACKER1_WALLET = ("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92267"):lower()

local config = {
    ETHER_PORTAL_ADDRESS = "0xFfdbe43d4c855BF7e0f105c400A50857f53AB044",
    DAPP_ADDRESS_RELAY_ADDRESS = "0xF5DE34d6BbC0446E2a45719E718efEbaaE179daE",
    DAPP_ADDRESS = "0x7122cd1221C20892234186facfE8615e6743Ab02",
}

local machine_config = "../.sunodo/image"
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
            res.state = json_decode(body)
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
        payload = string.pack(">I4", opts.opcode) .. json_encode(opts.data),
    }, true))
end

local function inspect_input(machine, opts)
    return decode_response_jsons(machine:inspect_state({
        payload = string.pack(">I4", opts.opcode) .. json_encode(opts.data),
    }, true))
end

local function advance_ether_deposit(machine, opts)
    return decode_response_jsons(machine:advance_state({
        metadata = { msg_sender = fromhex(config.ETHER_PORTAL_ADDRESS), timestamp = opts.timestamp },
        payload = cartesix_encoder.encode_ether_deposit({
            sender_address = fromhex(opts.sender),
            amount = int256.tobe(opts.amount),
            extra_data = string.pack(">I4", opts.opcode) .. json_encode(opts.data),
        }),
    }, true))
end

local function readfile(file)
    local f = assert(io.open(file, 'rb'))
    local contents = assert(f:read('a'))
    f:close()
    return contents
end

--------------------------------------------------------------------------------
-- Tests

local lua543_bounty_code = 'bounties/lua-bounty/lua-5.4.3-bounty_riscv64.tar.xz'
local lua543_bounty_exploit = readfile('bounties/lua-bounty/exploit-lua-5.4.3.lua')
local lua543_bounty_index = 0

local lua546_bounty_code = 'bounties/lua-bounty/lua-5.4.6-bounty_riscv64.tar.xz'

describe("basic tests", function()
    local machine <close> = cartesix_rolling_machine(machine_config, machine_runtime_config, machine_remote_protocol)
    machine:run_until_yield_or_halt()
    local started = 1697567000
    local deadline = started + 3600

    it("should relay dapp address", function()
        local res = machine:advance_state({
            metadata = {
                msg_sender = fromhex(config.DAPP_ADDRESS_RELAY_ADDRESS),
            },
            payload = fromhex(config.DAPP_ADDRESS),
        }, true)
        expect.equal(res.status, "accepted")
    end)

    it("should create a bounty", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            opcode = CodecOpcodes.CreateAppBounty,
            timestamp = started,
            data = {
                Name = "Lua 5.4.3 Bounty",
                Description = "Try to crash a sandboxed Lua 5.4.3 script",
                Deadline = deadline,
                CodeZipBinary = base64_encode(readfile(lua543_bounty_code)),
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
                    Deadline = deadline,
                    Description = "Try to crash a sandboxed Lua 5.4.3 script",
                    Exploit = null,
                    InputIndex = 1,
                    Sponsorships = null,
                    Started = started,
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
            timestamp = started + 1,
            data = {
                Name = "Developer1",
                BountyIndex = lua543_bounty_index,
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
                    Deadline = deadline,
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
                    Started = started,
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
            timestamp = started + 2,
            data = {
                Name = "Sponsor1",
                BountyIndex = lua543_bounty_index,
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
                    Deadline = deadline,
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
                    Started = started,
                    Withdrawn = false,
                },
            },
        })
    end)

    it("should reject sponsor withdraw for an invalid bounty", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            opcode = CodecOpcodes.WithdrawSponsorship,
            timestamp = deadline - 1,
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
            timestamp = deadline - 1,
            data = {
                BountyIndex = lua543_bounty_index,
            },
        })
        expect.equal(res.status, "rejected")
        expect.equal(res.error, "rejecting: can't withdraw before deadline")
    end)

    it("should accept inspect of a exploit that succeeded", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            opcode = CodecOpcodes.TestExploit,
            timestamp = deadline - 1,
            data = {
                BountyIndex = lua543_bounty_index,
                Exploit = base64_encode(lua543_bounty_exploit),
            },
        })
        expect.equal(res.status, "accepted")
    end)

    it("should reject inspect of a exploit that failed", function()
        local res = inspect_input(machine, {
            sender = HACKER1_WALLET,
            opcode = CodecOpcodes.TestExploit,
            timestamp = deadline - 1,
            data = {
                Name = "Hacker1",
                BountyIndex = lua543_bounty_index,
                Exploit = base64_encode([[print 'hello world']]),
            },
        })
        expect.equal(res.status, "rejected")
    end)

    it("should accept withdraw after deadline", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            opcode = CodecOpcodes.WithdrawSponsorship,
            timestamp = deadline,
            data = {
                BountyIndex = lua543_bounty_index,
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
                    Deadline = deadline,
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
                    Started = started,
                    Withdrawn = true,
                },
            },
        })
        expect.equal(res.vouchers, {
            {
                address = fromhex(config.DAPP_ADDRESS),
                payload = cartesix_encoder.encode_ether_transfer_voucher({
                    destination_address = DEVELOPER1_WALLET,
                    amount = int256.tobe("1000"),
                }),
            },
            {
                address = fromhex(config.DAPP_ADDRESS),
                payload = cartesix_encoder.encode_ether_transfer_voucher({
                    destination_address = SPONSOR1_WALLET,
                    amount = int256.tobe("2000"),
                }),
            },
        })
    end)

    it("should reject sponsor double withdraw", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            opcode = CodecOpcodes.WithdrawSponsorship,
            timestamp = deadline,
            data = {
                BountyIndex = lua543_bounty_index,
            },
        })
        expect.equal(res.status, "rejected")
        expect.equal(res.error, "rejecting: sponsorships already withdrawn")
    end)

    it("should reject exploit after deadline", function()
        local res = advance_input(machine, {
            sender = HACKER1_WALLET,
            opcode = CodecOpcodes.SendExploit,
            timestamp = deadline,
            data = {
                Name = "Hacker1",
                BountyIndex = lua543_bounty_index,
                Exploit = base64_encode([[print 'hello world']]),
            },
        })
        expect.equal(res.status, "rejected")
        expect.equal(res.error, "rejecting: can't run exploit after deadline")
    end)
end)

lester.report() -- Print overall statistic of the tests run.
lester.exit() -- Exit with success if all tests passed.
