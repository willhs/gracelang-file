"use strict";
 
var Task, fs, prim, read, rt, write, append, exists, util;
 
fs = require("fs");
 
Task = require("./task");
rt = require("./runtime");
prim = require("./runtime/primitives");
util = require("./util");
 
read = Task.taskify(fs.readFile);
write = Task.taskify(fs.writeFile);
append = Task.taskify(fs.appendFile);
exists = Task.taskify(fs.exists);
 
// Converts javascripts input string into grace string
function toString(string) {
  return rt.String.assert(string).then(function() {
    return string.asPrimitiveString();
  });
}
 
// Returns a type of file
function File(path) {
  prim.GraceObject.call(this);
 
  this.object.path = path;
}
 
util.inherits(File, prim.GraceObject);
 
// Reads the file and returns the contents
// Throws Internal Error: ENOENT if the file does not exist
File.prototype.read = rt.method("read", 0, function () {
  var self = this;
 
  return read(self.object.path).then(function (contents) {
    return rt.string(contents);
  });
});
 
// Returns the path from the file
File.prototype.path = rt.method("path", 0, function() {
   return this.object.path;
});
 
// Writes the given string to the contained file
// Throws an Assertion Error if the parameter is not of type String
// Creates a new file if the given path does not exist
File.prototype.write = rt.method("write()", 1, function (text) {
  var self = this;
 
  return toString(text).then(function (text) {
    return write(self.object.path, text).then(function (){
      return rt.done;
    });
  });
});
 
// Returns a True if the file exists, False if the file does not exist
File.prototype.exists = rt.method("exists", 0, function () {
  return exists(this.object.path).then(null, function(err){
    return rt.bool(err);
  });
});
 
// Appends the given text to the ed of the current file
// Return done if the file does not exist (creates * appends if no file exists)
File.prototype.append = rt.method("append()", 1, function (text) {
  var self = this;
 
  return toString(text).then(function (text){
    return append(self.object.path, text).then(function (){
      return rt.done;
    });
  });
});
 
exports.path = rt.method("path()", 1, function (path){
  // convert from GraceString to jscript string
  return toString(path).then(function(path) {
    return new File(path);
  });
});