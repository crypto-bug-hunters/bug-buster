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
    getenv = os.getenv,
    remove = os.remove,
    rename = os.rename,
    tmpname = os.tmpname,
    -- allow using exit filtering code 139 (segmentation fault)
    exit = function(code, close)
      assert(code >= 0 and code <= 127, 'os.exit: attempt to exit with a disallowed code')
      return os.exit(code, close)
    end
    -- rest of 'os' functions are considered unsafe
  },
  io = {
    open = io.open,
    close = io.close,
    flush = io.flush,
    input = io.input,
    lines = io.lines,
    output = io.output,
    read = io.read,
    write = io.write,
    type = io.type,
    tmpfile = io.tmpfile,
    stdin = io.stdin,
    stdout = io.stdout,
    stderr = io.stderr,
    -- rest of 'io' functions are considered unsafe
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
  -- dofile, load, loadfile: could crash when loading invalid binary chunks
  -- require: could require 'os' and other modules again
}
env._G = env
local main = assert(loadfile(arg[1], 't', env))
main()
