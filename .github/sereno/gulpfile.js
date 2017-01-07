if (process.env.CIRCLECI) {
  process.env.DISABLE_NOTIFIER = true;
}

var gulp = require('gulp');
var elixir = require('laravel-elixir');
var argv = require('yargs').argv;

elixir.config.publicPath = 'content/assets';

elixir(function (mix) {
  var env = argv.e || argv.env || 'default';

  mix.exec('sereno build --dir=../../ -v --env=' + env, [
        '../../*',
        '../../docs/*',
        '../../docs/**/*',
        'content/*',
        'content/**/*',
        'resources/*',
        'resources/**/*',
      ])
      .browserSync({
        server: {
          baseDir: 'public'
        },
        proxy: null,
        files: ['public/**/*']
      });
});
