local cartesix_rolling_machine = require("cartesix.rollingmachine")
local cartesix_encoder = require("cartesix.encoder")
local lester = require("lester")
local fromhex, tohex = cartesix_encoder.fromhex, cartesix_encoder.tohex
local int256 = require("bint")(256)
local describe, it, expect = lester.describe, lester.it, lester.expect
local null = require("cjson").null
local json_encode = require("cjson").encode
local json_decode = require("cjson").decode
local base64 = require("base64")

--------------------------------------------------------------------------------
-- Configurations

local DEVELOPER1_WALLET = ("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"):lower()
local HACKER1_WALLET = ("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92267"):lower()
local SPONSOR1_WALLET = ("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92268"):lower()

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

--------------------------------------------------------------------------------
-- Tests

describe("tests", function()
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
                Name = "Lua Bounty",
                Description = "Find Lua Bug",
                Deadline = deadline,
                CodeZipBinary = base64.encode([[print 'hello world']]),
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            Bounties = {
                {
                    App = {
                        Address = DEVELOPER1_WALLET,
                        ImgLink = "",
                        Name = "Lua Bounty",
                    },
                    CodePath = "cHJpbnQgJ2hlbGxvIHdvcmxkJw==",
                    Deadline = deadline,
                    Description = "Find Lua Bug",
                    Exploit = null,
                    InputIndex = 1,
                    Sponsorships = null,
                    Started = started,
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
                AppAddress = DEVELOPER1_WALLET,
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            Bounties = {
                {
                    App = {
                        Address = DEVELOPER1_WALLET,
                        ImgLink = "",
                        Name = "Lua Bounty",
                    },
                    CodePath = "cHJpbnQgJ2hlbGxvIHdvcmxkJw==",
                    Deadline = deadline,
                    Description = "Find Lua Bug",
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
                            Withdrawn = false,
                        },
                    },
                    Started = started,
                },
            },
        })
    end)

    it("should add sponsorship from a sponsor", function()
        local res = advance_ether_deposit(machine, {
            sender = SPONSOR1_WALLET,
            amount = 2000,
            opcode = CodecOpcodes.AddSponsorship,
            timestamp = started + 2,
            data = {
                Name = "Sponsor1",
                AppAddress = DEVELOPER1_WALLET,
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            Bounties = {
                {
                    App = {
                        Address = DEVELOPER1_WALLET,
                        ImgLink = "",
                        Name = "Lua Bounty",
                    },
                    CodePath = "cHJpbnQgJ2hlbGxvIHdvcmxkJw==",
                    Deadline = deadline,
                    Description = "Find Lua Bug",
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
                            Withdrawn = false,
                        },
                        {
                            Sponsor = {
                                Address = SPONSOR1_WALLET,
                                ImgLink = "",
                                Name = "Sponsor1",
                            },
                            Value = tohex(2000),
                            Withdrawn = false,
                        },
                    },
                    Started = started,
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
                AppAddress = HACKER1_WALLET,
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
                AppAddress = DEVELOPER1_WALLET,
            },
        })
        expect.equal(res.status, "rejected")
        expect.equal(res.error, "rejecting: can't withdraw before deadline")
    end)

    it("should accept sponsor withdraw after deadline", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            opcode = CodecOpcodes.WithdrawSponsorship,
            timestamp = deadline,
            data = {
                AppAddress = DEVELOPER1_WALLET,
            },
        })
        expect.equal(res.status, "accepted")
        expect.equal(res.state, {
            Bounties = {
                {
                    App = {
                        Address = DEVELOPER1_WALLET,
                        ImgLink = "",
                        Name = "Lua Bounty",
                    },
                    CodePath = "cHJpbnQgJ2hlbGxvIHdvcmxkJw==",
                    Deadline = deadline,
                    Description = "Find Lua Bug",
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
                            Withdrawn = true,
                        },
                        {
                            Sponsor = {
                                Address = SPONSOR1_WALLET,
                                ImgLink = "",
                                Name = "Sponsor1",
                            },
                            Value = tohex(2000),
                            Withdrawn = false,
                        },
                    },
                    Started = started,
                },
            },
        })
    end)

    it("should reject sponsor double withdraw", function()
        local res = advance_input(machine, {
            sender = DEVELOPER1_WALLET,
            opcode = CodecOpcodes.WithdrawSponsorship,
            timestamp = deadline,
            data = {
                AppAddress = DEVELOPER1_WALLET,
            },
        })
        expect.equal(res.status, "rejected")
        expect.equal(res.error, "rejecting: sponsorship already withdrawn")
    end)
end)
