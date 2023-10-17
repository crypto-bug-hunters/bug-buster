-- create environment with allowed modules and functions
local env = {
  -- variables
  _VERSION = _VERSION,
  -- _G: it could access other things

  -- modules
  coroutine = coroutine,
  math = math,
  string = string,
  table = table,
  utf8 = utf8,
  os = {
    clock = os.clock,
    date = os.date,
    difftime = os.difftime,
    time = os.time,
    -- rest of 'os' functions are unsafe
  },
  -- arg: not useful
  -- debug: has functions that could potentially crash the interpreter
  -- package: could access other modules

  -- functions
  assert = assert,
  error = error,
  type = type,
  next = next,
  select = select,
  pairs = pairs,
  ipairs = ipairs,
  print = print,
  rawequal = rawequal,
  rawget = rawget,
  rawlen = rawlen,
  rawset = rawset,
  tonumber = tonumber,
  tostring = tostring,
  pcall = pcall,
  xpcall = xpcall,
  setmetatable = setmetatable,
  getmetatable = getmetatable,
  collectgarbage = collectgarbage,
  -- dofile: could access the filesystem
  -- load: could crash when loading invalid binary chunks
  -- loadfile: could access the filesystem
  -- require: could require 'os' and other modules again
}
env._G = env
local code = assert(io.stdin:read('a'))
local main = assert(load(code, '@code', 't', env))
main()
