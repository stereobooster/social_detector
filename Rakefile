LIB_VERSION  = "0.0.1"
LIB_NAME = "social_detector"

LIB_ROOT     = File.expand_path(File.dirname(__FILE__))
LIB_SRC_DIR  = File.join(LIB_ROOT, 'src')
LIB_DIST_DIR = File.join(LIB_ROOT, 'dist')
LIB_PKG_DIR  = File.join(LIB_ROOT, 'pkg')

LIB_COMPONENTS = ['social_detector']

task :default => [:jshint, :clean, :dist]

LIB_TESTS = []

desc "Clean the distribution directory."
task :clean do
  rm_rf LIB_DIST_DIR
  mkdir LIB_DIST_DIR
end

def normalize_whitespace(filename)
  contents = File.readlines(filename)
  contents.each { |line| line.sub!(/\s+$/, "") }
  File.open(filename, "w") do |file|
    file.write contents.join("\n").sub(/(\n+)?\Z/m, "\n")
  end
end

desc "Strip trailing whitespace and ensure each file ends with a newline"
task :whitespace do
  Dir["*", "src/**/*", "test/**/*", "examples/**/*"].each do |filename|
    normalize_whitespace(filename) if File.file?(filename)
  end
end

desc "Concatenate source files to build lib"
task :concat, [:addons] => :whitespace do |task, args|
  # colon-separated arguments such as `concat[foo:bar:-baz]` specify
  # which components to add or exclude, depending on if it starts with "-"
  add, exclude = args[:addons].to_s.split(':').partition {|c| c !~ /^-/ }
  exclude.each {|c| c.sub!('-', '') }
  components = (LIB_COMPONENTS | add) - exclude

  unless components == LIB_COMPONENTS
    puts "Building lib by including: #{components.join(', ')}"
  end

  File.open(File.join(LIB_DIST_DIR, LIB_NAME + ".js"), 'w') do |f|
    f.puts components.map { |component|
      File.read File.join(LIB_SRC_DIR, "#{component}.js")
    }
  end
end

def google_compiler(src, target)
  puts "Minifying #{src} with Google Closure Compiler..."
  `java -jar vendor/google-compiler/compiler.jar --js #{src} --summary_detail_level 3 --js_output_file #{target}`
end

def yui_compressor(src, target)
  puts "Minifying #{src} with YUI Compressor..."
  `java -jar vendor/yuicompressor/yuicompressor-2.4.2.jar #{src} -o #{target}`
end

def uglifyjs(src, target)
  begin
    require 'uglifier'
  rescue LoadError => e
    if verbose
      puts "\nYou'll need the 'uglifier' gem for minification. Just run:\n\n"
      puts "  $ gem install uglifier"
      puts "\nand you should be all set.\n\n"
      exit
    end
    return false
  end
  puts "Minifying #{src} with UglifyJS..."
  File.open(target, "w"){|f| f.puts Uglifier.new.compile(File.read(src))}
end

def process_minified(src, target)
  cp target, File.join(LIB_DIST_DIR,'temp.js')
  msize = File.size(File.join(LIB_DIST_DIR,'temp.js'))
  # `gzip -9 #{File.join(LIB_DIST_DIR,'temp.js')}`

  osize = File.size(src)
  # dsize = File.size(File.join(LIB_DIST_DIR,'temp.js.gz'))
  # rm_rf File.join(LIB_DIST_DIR,'temp.js.gz')
  rm_rf File.join(LIB_DIST_DIR,'temp.js')

  puts "Original version: %.3fk" % (osize/1024.0)
  puts "Minified: %.3fk" % (msize/1024.0)
  # puts "Minified and gzipped: %.3fk, compression factor %.3f" % [dsize/1024.0, osize/dsize.to_f]
end

desc "Generates a minified version for distribution, using UglifyJS."
task :dist do
  src, target = File.join(LIB_SRC_DIR, LIB_NAME + ".js"), File.join(LIB_DIST_DIR, LIB_NAME + ".min.js")
  uglifyjs src, target
  process_minified src, target
end

desc "Generates a minified version for distribution using the Google Closure compiler."
task :googledist do
  src, target = File.join(LIB_DIST_DIR, LIB_NAME + ".js"), File.join(LIB_DIST_DIR, LIB_NAME + ".min.js")
  google_compiler src, target
  process_minified src, target
end

desc "Generates a minified version for distribution using the YUI compressor."
task :yuidist do
  src, target = File.join(LIB_DIST_DIR, LIB_NAME + ".js"), File.join(LIB_DIST_DIR, LIB_NAME + ".min.js")
  yui_compressor src, target
  process_minified src, target
end

desc "Generate docco documentation from sources."
task :docs do
  puts "Generating docs..."
  puts "Note: to work, install node.js first, then install docco with 'sudo npm install docco -g'."
  puts `docco src/*`
end

require 'rake/packagetask'
Rake::PackageTask.new(LIB_NAME, LIB_VERSION) do |package|
  package.need_tar_gz = true
  package.need_zip = true
  package.package_dir = LIB_PKG_DIR
  package.package_files.include(
    'Readme.md',
    'dist/**/*',
    'src/**/*',
  ).exclude(*`git ls-files -o src -z`.split("\0"))
end

desc "Run tests in headless WebKit"
task :test => "jasmine:headless" do
  require 'rubygems'
  require 'rubygems/specification'

  # HACK: jasmine-headless-webkit doesn't let us access its compiled specrunner directly
  if jasmine_gem = Gem::Specification.find_by_name('jasmine-headless-webkit')
    headless_root = jasmine_gem.full_gem_path
    runner = File.join(headless_root, 'ext/jasmine-webkit-specrunner/jasmine-webkit-specrunner')

    exec runner, '-c', *LIB_TESTS
  else
    abort "Can't find 'jasmine-headless-webkit' gem"
  end
end

def silence_warnings
  require 'stringio'
  begin
    old_stderr = $stderr
    $stderr = StringIO.new
    yield
  ensure
    $stderr = old_stderr
  end
end

begin
  silence_warnings {
    require 'jasmine'
    load 'jasmine/tasks/jasmine.rake'
    require 'jasmine/headless/task'
  }

  Jasmine::Headless::Task.new do |task|
    task.colors = true
  end
rescue LoadError
  task :jasmine do
    abort "Jasmine is not available. In order to run jasmine, you must: (sudo) gem install jasmine"
  end
end

require "jshintrb/jshinttask"
Jshintrb::JshintTask.new :jshint do |t|
  t.pattern = 'src/**/*.js'
  t.options = {
      :bitwise => true,
      :curly => true,
      :eqeqeq => true,
      :forin => false,
      :immed => true,
      :latedef => true,
      :newcap => true,
      :noarg => true,
      :noempty => true,
      :nonew => true,
      :plusplus => true,
      :regexp => true,
      :undef => true,
      :strict => true,
      :trailing => true,
      :browser => true,
      :undef => true,
      :predef => [
        "VK",
        "FB"
      ]
  }
end
