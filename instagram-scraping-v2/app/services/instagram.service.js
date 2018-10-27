var request = require('request');
var Promise = require('bluebird');
var settings = require('../../config/app.settings');
var fs = require('fs');

//#region Medias
var getUserMediasInit = function(username) {
    return new Promise((resolve, reject) => {
        if(!username) {
            return reject(new Error('Argument "username" must be specified'));
        }

        var options = {        
            url: `https://www.instagram.com/${username}`,
            method: 'GET'
        };
        request(options, (err, response, body) => {
            if(err) {
                reject(new Error('Error while retrieve data user page'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var patternRegex = /window\._sharedData\s?=\s?({.+);<\/script>/;

            try {
                var dataString = body.match(patternRegex)[1];
                var json = JSON.parse(dataString);

                if(json) {
                    var objReturn = {};
                    objReturn.activity_counts = json.activity_counts;
                    objReturn.config = json.config;
                    objReturn.country_code = json.country_code;
                    objReturn.language_code = json.language_code;
                    objReturn.locale = json.locale;
                    objReturn.entry_data = json.entry_data;
                    objReturn.hostname = json.hostname;
                    objReturn.platform = json.platform;
                    objReturn.rhx_gis = json.rhx_gis;
                    objReturn.nonce = json.nonce;
                    objReturn.zero_data = json.zero_data;
                    objReturn.rollout_hash = json.rollout_hash;
                    return resolve(objReturn);
                } else {
                    return reject(new Error('Error scraping user page'));
                }
            }
            catch(e) {
                return reject(new Error('The HTML returned from instagram was not suitable for scraping'));
            }
        });
    });
};
var getUserMedias = function(userId, end_cursor) {
    return new Promise((resolve, reject) => {
        if(!userId) {
            return reject(new Error('Argument "userId" must be specified'));
        }
        if(!end_cursor) {
            return reject(new Error('Argument "end_cursor" must be specified'));
        }

        var count = 50;
        var url = 'https://www.instagram.com/graphql/query/?query_hash=e7e2f4da4b02303f74f0841279e52d76&variables=%7B%22id%22%3A%22'+ userId+'%22%2C%22first%22%3A'+count+'%2C%22after%22%3A%22'+end_cursor+'%22%7D';
        var options = {        
            url: url,
            method: 'GET',
            headers: {        
                'Cookie': settings.cookie
            }
        };
        request(options, (err, response, body) => {
            if(err) {
                reject(new Error('Error while retrieve data user page'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var json = JSON.parse(body);

            if(json.data && json.data.user) {
                return resolve(json.data);
            } else {
                return reject(new Error('Error scraping user page'));
            }
        });
    });
};
var getUserTaggedMedias = function(userId, end_cursor = null) {
    return new Promise((resolve, reject) => {
        if(!userId) {
            return reject(new Error('Argument "userId" must be specified'));
        }

        var count = 50;
        var url = '';
        if(end_cursor != null) {
            url = 'https://www.instagram.com/graphql/query/?query_hash=de71ba2f35e0b59023504cfeb5b9857e&variables=%7B%22id%22%3A%22'+ userId+'%22%2C%22first%22%3A12%2C%22after%22%3A%22'+end_cursor+'%22%7D';
        } else {
            url = 'https://www.instagram.com/graphql/query/?query_hash=de71ba2f35e0b59023504cfeb5b9857e&variables=%7B%22id%22%3A%22' + userId + '%22%2C%22first%22%3A12%7D';
        }
        
        var options = {        
            url: url,
            method: 'GET',
            headers: {        
                'Cookie': settings.cookie
            }
        };

        request.get(options, (err, response, body) => {
            if(err) {
                reject(new Error('Error while retrieve data user tagged medias'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            try {
                var json = JSON.parse(body);

                if(json.data) {
                    return resolve(json.data);
                } else {
                    return reject(new Error('Error scraping user page'));
                }
            } catch(e) {
                return reject(new Error(e));
            }
        });
    });

    // https://www.instagram.com/graphql/query/?query_hash=de71ba2f35e0b59023504cfeb5b9857e&variables=%7B%22id%22%3A%226631006211%22%2C%22first%22%3A12%7D
    // https://www.instagram.com/graphql/query/?query_hash=de71ba2f35e0b59023504cfeb5b9857e&variables=%7B%22id%22%3A%226631006211%22%2C%22first%22%3A12%2C%22after%22%3A%22AQC9XjUPVKoE_U-aSFGINrdavCH5Q2lVOWafcMjQVdxJOClnP-8AAMuiHzytixNuqbHGYAsQ3usGNVhK4Al3uz9-0JRTZ9tlh0BtbqpJdfsLtg%22%7D
}
//#endregion

//#region Followers
var getUserFollowers = function(userId, end_cursor = null) {
    return new Promise((resolve, reject) => {
        if(!userId) {
            return reject(new Error('Argument "userId" must be specified'));
        }

        var count = 50;
        var url = '';
        if(end_cursor != null) {
            url = 'https://www.instagram.com/graphql/query/?query_hash=149bef52a3b2af88c0fec37913fe1cbc&variables=%7B%22id%22%3A%22'+ userId+'%22%2C%22first%22%3A'+count+'%2C%22after%22%3A%22'+end_cursor+'%22%7D';
        } else {
            url = 'https://www.instagram.com/graphql/query/?query_hash=149bef52a3b2af88c0fec37913fe1cbc&variables=%7B%22id%22%3A%22' + userId + '%22%2C%22first%22%3A24%7D';
        }
        
        var options = {        
            url: url,
            method: 'GET',
            headers: {        
                'Cookie': settings.cookie
            }
        };

        request.get(options, (err, response, body) => {
            if(err) {
                reject(new Error('Error while retrieve data user followers'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            try {
                var json = JSON.parse(body);

                if(json.data) {
                    return resolve(json.data);
                } else {
                    return reject(new Error('Error scraping user page'));
                }
            } catch(e) {
                return reject(new Error(e));
            }
        });
    });
}
//#endregion

//#region Following
var getUserFollowing = function(userId, end_cursor = null) {
    return new Promise((resolve, reject) => {
        if(!userId) {
            return reject(new Error('Argument "userId" must be specified'));
        }

        var count = 50;
        var url = '';
        if(end_cursor != null) {
            url = 'https://www.instagram.com/graphql/query/?query_hash=9335e35a1b280f082a47b98c5aa10fa4&variables=%7B%22id%22%3A%22'+ userId+'%22%2C%22first%22%3A'+count+'%2C%22after%22%3A%22'+end_cursor+'%22%7D';
        } else {
            url = 'https://www.instagram.com/graphql/query/?query_hash=9335e35a1b280f082a47b98c5aa10fa4&variables=%7B%22id%22%3A%22' + userId + '%22%2C%22first%22%3A24%7D';
        }
        
        var options = {        
            url: url,
            method: 'GET',
            headers: {        
                'Cookie': settings.cookie
            }
        };

        request.get(options, (err, response, body) => {
            if(err) {
                reject(new Error('Error while retrieve data user following'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            try {
                var json = JSON.parse(body);

                if(json.data) {
                    return resolve(json.data);
                } else {
                    return reject(new Error('Error scraping user page'));
                }
            } catch(e) {
                return reject(new Error(e));
            }
        });
    });
}
//#endregion

//#region Feed
var getUserFeedInit = function() {
    return new Promise((resolve, reject) => {        
        
        var url = 'https://www.instagram.com/graphql/query/?query_hash=9b55cb567f47106cdc3e4612280b9d61&variables=%7B%7D';

        var options = {        
            url: url,
            method: 'GET',
            headers: {        
                'Cookie': settings.cookie
            }
        };

        request.get(options, (err, response, body) => {
            if(err) {
                reject(new Error('Error while retrieve data user following'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            try {
                var json = JSON.parse(body);

                if(json.data) {
                    return resolve(json.data);
                } else {
                    return reject(new Error('Error scraping user page'));
                }
            } catch(e) {
                return reject(new Error(e));
            }
        });
    });
};
var getUserFeed = function(end_cursor) {
    return new Promise((resolve, reject) => {
        
        if(!end_cursor) {
            return reject(new Error('Argument "end_cursor" must be specified'));
        }

        var url = 'https://www.instagram.com/graphql/query/?query_hash=9b55cb567f47106cdc3e4612280b9d61&variables=%7B%22fetch_media_item_count%22%3A12%2C%22fetch_media_item_cursor%22%3A%22' + end_cursor + '%3D%22%2C%22fetch_comment_count%22%3A4%2C%22fetch_like%22%3A10%2C%22has_stories%22%3Afalse%7D';
        
        var options = {        
            url: url,
            method: 'GET',
            headers: {        
                'Cookie': settings.cookie
            }
        };

        request.get(options, (err, response, body) => {
            if(err) {
                reject(new Error('Error while retrieve data user following'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            try {
                var json = JSON.parse(body);

                if(json.data) {
                    return resolve(json.data);
                } else {
                    return reject(new Error('Error scraping user page'));
                }
            } catch(e) {
                return reject(new Error(e));
            }
        });
    });
}
var getUserFeedStoriesAvailables = function() {
    return new Promise((resolve, reject) => {        
        
        var url = 'https://www.instagram.com/graphql/query/?query_hash=abc60b755363b5c230111347a7a4e242001&variables=%7B%22only_stories%22%3Afalse%7D';

        var options = {        
            url: url,
            method: 'GET',
            headers: {        
                'Cookie': settings.cookie
            }
        };

        request.get(options, (err, response, body) => {
            if(err) {
                reject(new Error('Error while retrieve data user following'));
            }

            if(body == null) {                
                return reject(new Error('Body is empty'));
            }

            try {
                var json = JSON.parse(body);
                console.log(json)

                if(json.data) {
                    return resolve(json.data);
                } else {
                    return reject(new Error('Error scraping user page - ' + json.message));
                }
            } catch(e) {
                return reject(new Error(e));
            }
        });
    });    
}
//#endregion

//#region Story
var getStoryList = function(reel_ids) {
    return new Promise((resolve, reject) => {
        
        if(!reel_ids) {
            return reject(new Error('Argument "reel_ids" must be specified'));
        }

        var url = 'https://www.instagram.com/graphql/query/?query_hash=45246d3fe16ccc6577e0bd297a5db1ab&variables=%7B%22reel_ids%22%3A%5B%22'+ reel_ids + '%22%5D%2C%22tag_names%22%3A%5B%5D%2C%22location_ids%22%3A%5B%5D%2C%22highlight_reel_ids%22%3A%5B%5D%2C%22precomposed_overlay%22%3Afalse%7D';
        
        var options = {        
            url: url,
            method: 'GET',
            headers: {        
                'Cookie': settings.cookie
            }
        };

        request.get(options, (err, response, body) => {
            if(err) {
                reject(new Error('Error while retrieve data user following'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            try {
                var json = JSON.parse(body);

                if(json.data) {
                    return resolve(json.data);
                } else {
                    return reject(new Error('Error scraping user page'));
                }
            } catch(e) {
                return reject(new Error(e));
            }
        });
    });
}
var getUserRecentStories = function(userId) {
    return new Promise((resolve, reject) => {
        if(!userId) {
            return reject(new Error('Argument "userId" must be specified'));
        }
        var url = 'https://www.instagram.com/graphql/query/?query_hash=45246d3fe16ccc6577e0bd297a5db1ab&variables=%7B%22reel_ids%22%3A%5B%22' + userId + '%22%5D%2C%22tag_names%22%3A%5B%5D%2C%22location_ids%22%3A%5B%5D%2C%22highlight_reel_ids%22%3A%5B%5D%2C%22precomposed_overlay%22%3Afalse%7D';
        var options = {        
            url: url,
            method: 'GET',
            headers: {        
                'Cookie': settings.cookie
            }
        };

        request.get(options, (err, response, body) => {
            if(err) {
                reject(new Error('Error while retrieve data user following'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            try {
                var json = JSON.parse(body);

                if(json.data) {
                    return resolve(json.data);
                } else {
                    return reject(new Error('Error scraping user page'));
                }
            } catch(e) {
                return reject(new Error(e));
            }
        });
    });    
}
var getUserHighlightStories = function(userId) {
    return new Promise((resolve, reject) => {
        if(!userId) {
            return reject(new Error('Argument "userId" must be specified'));
        }
        var url = 'https://www.instagram.com/graphql/query/?query_hash=7c16654f22c819fb63d1183034a5162f&variables=%7B%22user_id%22%3A%22' + userId + '%22%2C%22include_chaining%22%3Atrue%2C%22include_reel%22%3Atrue%2C%22include_suggested_users%22%3Afalse%2C%22include_logged_out_extras%22%3Afalse%2C%22include_highlight_reels%22%3Atrue%7D';
                   
        var options = {        
            url: url,
            method: 'GET',
            headers: {        
                'Cookie': settings.cookie
            }
        };

        request.get(options, (err, response, body) => {
            if(err) {
                reject(new Error('Error while retrieve data user highlight stories'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            try {
                var json = JSON.parse(body);

                if(json.data) {                    
                    var highlight_reels = json.data.user.edge_highlight_reels.edges;
                    var ids = [];
                    highlight_reels.forEach(item => {
                        ids.push(item.node.id);
                    });
                    console.log(highlight_reels);

                    var reel_ids = ids.join('%22%2C%22');
                    var url_hr = 'https://www.instagram.com/graphql/query/?query_hash=45246d3fe16ccc6577e0bd297a5db1ab&variables=%7B%22reel_ids%22%3A%5B%5D%2C%22tag_names%22%3A%5B%5D%2C%22location_ids%22%3A%5B%5D%2C%22highlight_reel_ids%22%3A%5B%22' + reel_ids + '%22%5D%2C%22precomposed_overlay%22%3Afalse%7D';
                    var opt = {
                        url: url_hr,
                        method: 'GET',
                        headers: {        
                            'Cookie': settings.cookie
                        }
                    }
                    request.get(opt, (err, response, body) => {
                        if(err) {
                            reject(new Error('Error while retrieve data user highlight stories'));
                        }
            
                        if(body == null) {
                            return reject(new Error('Body is empty'));
                        }

                        try {
                            var jsonHr = JSON.parse(body);
                            if(jsonHr.data) {
                                return resolve(jsonHr);
                            } else {
                                return reject(new Error('Error scraping user page'));
                            }
                        } catch(e) {
                            return reject(new Error(e));
                        }
                    });
                } else {
                    return reject(new Error('Error scraping user page'));
                }
            } catch(e) {
                return reject(new Error(e));
            }
        });
    });
}
//#endregion

//#region Activity
var getUserActivityNotifications = function() {
    return new Promise((resolve, reject) => {        
        
        var url = 'https://www.instagram.com/accounts/activity/?__a=1&include_reel=true';

        var options = {        
            url: url,
            method: 'GET',
            headers: {        
                'Cookie': settings.cookie
            }
        };

        request.get(options, (err, response, body) => {
            if(err) {
                reject(new Error('Error while retrieve data user activity notifications'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            try {
                var json = JSON.parse(body);
                
                if(json.graphql) {
                    return resolve(json.graphql);
                } else {
                    return reject(new Error('Error scraping user page'));
                }
            } catch(e) {
                return reject(new Error(e));
            }
        });
    });
}

// edge_suggested_users
// https://www.instagram.com/graphql/query/?query_hash=ae21d996d1918b725a934c0ed7f59a74&variables=%7B%22fetch_media_count%22%3A0%2C%22fetch_suggested_count%22%3A20%2C%22ignore_cache%22%3Atrue%2C%22filter_followed_friends%22%3Atrue%2C%22seen_ids%22%3A%5B%5D%2C%22include_reel%22%3Atrue%7D


// edge_web_discover_media
// https://www.instagram.com/graphql/query/?query_hash=ecd67af449fb6edab7c69a205413bfa7&variables=%7B%22first%22%3A24%7D
// https://www.instagram.com/graphql/query/?query_hash=ecd67af449fb6edab7c69a205413bfa7&variables=%7B%22first%22%3A24%2C%22after%22%3A%221%22%7D
// {"first":24,"after":"1"}



//#endregion


//#region Save Medias
var checkDirectorySync = function(directory) {
    try {
        fs.statSync(directory);
    } catch(e) {
        fs.mkdirSync(directory);
    }
};

var saveMedias = function(mediaUrl, saveTo, filename) {
    return new Promise(function(resolve, reject) {
        if (!mediaUrl) {
            return reject(new Error('Argument "mediaUrl" must be specified'));
        }

        var options = {
            url: mediaUrl,
            method: 'GET',
            encoding: 'binary',
            rejectUnauthorized: false
        }

        request(options, function(error, response, body) {
            var path = `${saveTo}/${filename}`;
            fs.writeFile(path, body, 'binary', (err) => {
                if(err) {
                    console.log('Erro ao tentar salvar a media: ', err);
                    reject(new Error('Erro ao tentar salvar a media'));
                }
                resolve({ status:'OK', data: { message: 'Media salva com sucesso'} });
            });
        })

    });
};
//#endregion

exports.getUserMediasInit = getUserMediasInit;
exports.getUserMedias = getUserMedias;
exports.getUserTaggedMedias = getUserTaggedMedias;
exports.getUserActivityNotifications = getUserActivityNotifications;

exports.getUserFollowers = getUserFollowers;
exports.getUserFollowing = getUserFollowing;

exports.getUserFeedInit = getUserFeedInit;
exports.getUserFeed = getUserFeed;
exports.getUserFeedStoriesAvailables = getUserFeedStoriesAvailables;

exports.getStoryList = getStoryList;
exports.getUserRecentStories = getUserRecentStories;
exports.getUserHighlightStories = getUserHighlightStories;

exports.saveMedias = saveMedias;
exports.checkDirectorySync = checkDirectorySync;

//exports.download = download;
// var download = function(url, tempFilepath, filepath, callback) {
//     var tempFile = fs.createWriteStream(tempFilepath);
//     tempFile.on('open', function(fd) {
//         http.request(url, function(res) {
//             res.on('data', function(chunk) {
//                 tempFile.write(chunk);
//             }).on('end', function() {
//                 tempFile.end();
//                 fs.renameSync(tempFile.path, filepath);
//                 return callback(filepath);
//             });
//         });
//     });
// }