(function() {
  var COMMANDS, TAB, argv, c, command, fs, optimist, possibilities,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  optimist = require('optimist');

  COMMANDS = ['cover', 'report'];

  TAB = '        ';

  argv = optimist.usage("Usage: $0 subcommand\n=== subcommands ===\n" + TAB + (COMMANDS.join("\n" + TAB))).argv;

  command = argv._[0];

  if (command == null) {
    optimist.showHelp();
    process.exit(0);
  }

  if (__indexOf.call(COMMANDS, command) < 0) {
    possibilities = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = COMMANDS.length; _i < _len; _i++) {
        c = COMMANDS[_i];
        if (command === c.slice(0, command.length)) {
          _results.push(c);
        }
      }
      return _results;
    })();
    switch (possibilities.length) {
      case 0:
        console.error("Unrecognised command: `" + command + "`. Run `" + argv['$0'] + "` for help.");
        process.exit(1);
        break;
      case 1:
        command = possibilities[0];
        break;
      default:
        console.error("Ambiguous command `" + command + "` matches `" + (possibilities.join('`, `')) + "`");
        process.exit(1);
    }
  }

  (require("./" + command))(argv, function(err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    return process.exit(0);
  });

}).call(this);
