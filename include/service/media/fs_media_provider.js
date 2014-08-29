/*
    Copyright (C) 2014  PencilBlue, LLC

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

//dependencies

/**
 *
 * @class FsMediaProvider
 * @constructor
 */
function FsMediaProvider(parentDir) {
    this.parentDir = parentDir;
};

FsMediaProvider.prototype.getStream = function(mediaPath) {
    var ap = FsMediaProvider.getMediaPath(this.parentDir, mediaPath);
    return fs.createReadStream(ap);
};

FsMediaProvider.prototype.get = function(mediaPath, cb) {
    var ap = FsMediaProvider.getMediaPath(this.parentDir, mediaPath);
    fs.readFile(ap, cb);
};

FsMediaProvider.prototype.setStream = function(stream, mediaPath, cb) {
    
    var fileStream = this.createWriteStream(mediaPath);
    fileStream.once('end', cb);
    fileStream.once('error', cb);
    stream.pipe(fileStream);
};

FsMediaProvider.prototype.set = function(fileDataStrOrBuff, mediaPath, cb) {
    var ap = FsMediaProvider.getMediaPath(this.parentDir, mediaPath);
    this.mkdirs(ap, function(err) {
        if (util.isError(err)) {
            return cb(err);
        }
        fs.writeFile(ap, fileDataStrOrBuff, cb);
    });
};

FsMediaProvider.prototype.createWriteStream = function(mediaPath) {
    var ap = FsMediaProvider.getMediaPath(this.parentDir, mediaPath);
    return fs.createWriteStream(ap);
};

FsMediaProvider.prototype.exists = function(mediaPath, cb) {
    var ap = FsMediaProvider.getMediaPath(this.parentDir, mediaPath);
    fs.exists(ap, function(exists) {
        cb(null, exists);
    });
};

FsMediaProvider.prototype.delete = function(mediaPath, cb) {
    var ap = FsMediaProvider.getMediaPath(this.parentDir, mediaPath);
    fs.exists(ap, function(exists) {
        fs.unlink(ap, cb);
    });
};
        
FsMediaProvider.prototype.stat = function(mediaPath, cb) {
    var ap = FsMediaProvider.getMediaPath(this.parentDir, mediaPath);
    fs.stat(ap, cb);
};

FsMediaProvider.prototype.mkdirs = function(absoluteFilePath, cb) {
    
    var pieces = absoluteFilePath.split('/');
    
    var curr = '';
    var tasks = pb.utils.getTasks(pieces, function(pieces, i) {
        return function(callback) {
            
            //we need to skip the first one bc it will probably empty and we 
            //want to skip the last one because it will probably be the file 
            //name not a directory.
            var p = pieces[i];
            if (p.length === 0 || i >= pieces.length - 1) {
                return callback();   
            }
            
            curr += '/' + p;
            fs.mkdir(curr, callback);
        };
    });
    async.series(tasks, cb);
};
    
FsMediaProvider.getMediaPath = function(parentDir, mediaPath) {
  
    var absolutePath = '';
    if (parentDir.indexOf('/') !== 0) {
        
        //we have a relative path meant to be from the project directory
        absolutePath = path.join(DOCUMENT_ROOT, parentDir, mediaPath);
    }
    else {
        absolutePath = path.join(parentDir, mediaPath);
    }
    return absolutePath;
};

//exports
module.exports = FsMediaProvider;
