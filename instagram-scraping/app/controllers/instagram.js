var request = require('request'),
    Promise = require('bluebird'),
    async   = require('async'),
    userURL = 'https://www.instagram.com/',
    listURL = 'https://www.instagram.com/explore/tags/',
    postURL = 'https://www.instagram.com/p/',
    locURL  = 'https://www.instagram.com/explore/locations/',
    dataExp = /window\._sharedData\s?=\s?({.+);<\/script>/;

// var Cookie = require('request-cookies').Cookie;
var settings = require('../../config/appConfig');
var fs = require('fs');

exports.scrapeUserPageInit = function(username) {
    return new Promise(function(resolve, reject) {
        if(!username) {
            return reject(new Error('Argument "username" must be specified'));
        }

        var url = userURL + username + '/';
		console.log(url);

        request(url, (err, response, body) => {
            
            if(err) {
                reject(new Error('Error while retrieve user data'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var data = scrape(body);

            if(data && data.entry_data && 
                data.entry_data.ProfilePage && 
                data.entry_data.ProfilePage[0] && 
                data.entry_data.ProfilePage[0].graphql && 
                data.entry_data.ProfilePage[0].graphql.user && 
                data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media &&
                data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.count > 0 && 
                data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges) {
                    var user = data.entry_data.ProfilePage[0].graphql.user;
                    var edges =  user.edge_owner_to_timeline_media.edges; 
                    var page_info = user.edge_owner_to_timeline_media.page_info;
                    var all_medias = user.edge_owner_to_timeline_media.count;

                    var rhx_gis = data.rhx_gis;
                    var csrf_token = data.config.csrf_token;
                    var cookies = parseCookies(response, user.id);

                    var json = {};
                    json.all_medias = all_medias;
                    json.user = user;
                    json.edges = edges;
                    json.page_info = page_info;
                    json.rhx_gis = rhx_gis;
                    json.csrf_token = csrf_token;
                    json.cookies = cookies;

                    return resolve(json);
                }
        });
    });
};

exports.scrapeUserPageOther = function(url, signature) {
    
    return new Promise(function(resolve, reject) {
        if(!url) {
            return reject(new Error('Argument "url" must be specified'));
        }

        var options = {        
            url: url,
            method: 'GET',
            headers: {
                'X-Instagram-GIS': signature,
                'Cookie': settings.cookie
            }
        };
        
        request(options, function(err, response, body) { 

            if(err) {
                reject(new Error('Error while retrieve data user page'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var jsonData = scrapeOthers(body);

            if(jsonData.data && jsonData.data.user) {
                var data = jsonData.data;
                var user = data.user;
                var page_info = user.edge_owner_to_timeline_media.page_info;
                var edges = user.edge_owner_to_timeline_media.edges;
                var all_medias = user.edge_owner_to_timeline_media.count;

                var json = {};
                json.all_medias = all_medias;
                json.edges = edges;
                json.page_info = page_info;

                return resolve(json);
                
                // async.waterfall([
                //     (callback) => {
                //         var medias = [];
                //         edges.forEach((post)=>{
                //             if(post.node.__typename === 'GraphImage') {
                //                 medias.push(exports.scrapePostDataOthers(post))
                //             }
                //         });
                //         callback(null, medias);
                //     }
                // ], (err, results) => {
                //     resolve({
                //         count: all_medias,
                //         total_returned : results.length,
                //         page_info: page_info,
                //         medias : results
                //     })
                // })
            }
            else {
                reject(new Error('Error scraping user page: "' + url + '"'));
            }            
        });
    });
};

exports.scrapeUserPage = function(username) {
    return new Promise(function(resolve, reject) {
        if(!username) {
            return reject(new Error('Argument "username" must be specified'));
        }            

        var url = userURL + username;        
        request(url, function(err, response, body) {
            var data = scrape(body);
            if (data && data.entry_data && 
                data.entry_data.ProfilePage && 
                data.entry_data.ProfilePage[0] && 
                data.entry_data.ProfilePage[0].graphql && 
                data.entry_data.ProfilePage[0].graphql.user && 
                data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media &&
                data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.count > 0 && 
                data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges) {

                    var user = data.entry_data.ProfilePage[0].graphql.user;
                    var edges =  user.edge_owner_to_timeline_media.edges; 
                    var page_info = user.edge_owner_to_timeline_media.page_info;
                    var all_medias = user.edge_owner_to_timeline_media.count;

                    var rhx_gis = data.rhx_gis;
                    var csrf_token = data.config.csrf_token;
                    var cookies = parseCookies(response, user.id);

                    var json = {};
                    json.all_medias = all_medias;
                    json.user = user;
                    json.edges = edges;
                    json.page_info = page_info;
                    json.rhx_gis = rhx_gis;
                    json.csrf_token = csrf_token;
                    json.cookies = cookies;
                    return resolve(json);
                    /*
                    async.waterfall([
                        (callback)=>{
                            var medias = [];
                            edges.forEach((post)=>{
                                if(post.node.__typename === 'GraphImage') {
                                    medias.push(exports.scrapePostData(post))
                                }
                            });
                            callback(null, medias);
                        }    
                    ], (err, results)=>{
                            resolve({
                                count: all_medias,
                                total_returned : results.length,
                                page_info: page_info,
                                userId: userId,
                                username: username,
                                rhx_gis: rhx_gis,
                                csrf_token: csrf_token,
                                medias : results,
                                cookies: cookies
                            })   
                    })
                    */
            }
            else {
                reject(new Error('Error scraping user page "' + username + '"'));
            }
        });
    });
};

exports.scrapeLastUserStories = function(pk) {
    return new Promise(function(resolve, reject) {
        if(!pk) {
            return reject(new Error('Argument "pk" must be specified'));
        }

        var url = 'https://www.instagram.com/graphql/query/?query_hash=45246d3fe16ccc6577e0bd297a5db1ab&variables=%7B%22reel_ids%22%3A%5B%22' + pk + '%22%5D%2C%22tag_names%22%3A%5B%5D%2C%22location_ids%22%3A%5B%5D%2C%22highlight_reel_ids%22%3A%5B%5D%2C%22precomposed_overlay%22%3Afalse%7D';
        var options = {
            url: url,
            method: 'GET',
            headers: {
                'Cookie': settings.cookie
            }
        }

        request(options, function(err, response, body) {
            if(err) {
                reject(new Error('Error while retrieve data user stories'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var json = JSON.parse(body);

            if(json.data && json.data.reels_media) {
                var data_reels_media = json.data;
                return resolve(data_reels_media);
            } else {
                reject(new Error('Error scraping user stories'));
            } 
        });
    });
};

exports.scrapeUserFollowersInit = function(pk) {
    return new Promise(function(resolve, reject) {
        if(!pk) {
            return reject(new Error('Argument "pk" must be specified'));
        }

        var count = 50;
        var url = 'https://www.instagram.com/graphql/query/?query_hash=149bef52a3b2af88c0fec37913fe1cbc&variables=%7B%22id%22%3A%22'+ pk +'%22%2C%22first%22%3A'+ count +'%7D';
        var options = {
            url: url,
            method: 'GET',
            headers: {
                'Cookie': settings.cookie
            }
        }

        request(options, function(err, response, body) {
            if(err) {
                reject(new Error('Error while retrieve data user followers'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var json = JSON.parse(body);

            if(json.data && json.data.user.edge_followed_by) {
                var user_edge_followed_by = json.data.user.edge_followed_by;
                return resolve(user_edge_followed_by);
            } else {
                reject(new Error('Error scraping user followers init'));
            }
        });
    });
};

exports.scrapeUserFollowingInit = function(pk) {
    return new Promise(function(resolve, reject) {
            if(!pk) {
                return reject(new Error('Argument "pk" must be specified'));
            }

            var count = 50;
            var url = 'https://www.instagram.com/graphql/query/?query_hash=9335e35a1b280f082a47b98c5aa10fa4&variables=%7B%22id%22%3A%22'+pk+'%22%2C%22first%22%3A'+count+'%7D';
            var options = {
                url: url,
                method: 'GET',
                headers: {
                    'Cookie': settings.cookie
                }
            }

            request(options, function(err, response, body) {
                if(err) {
                    reject(new Error('Error while retrieve data user following init'));
                }

                if(body == null) {
                    return reject(new Error('Body is empty'));
                }

                var json = JSON.parse(body);
                
                if(json.data && json.data.user.edge_follow) {
                    var user_edge_follow = json.data.user.edge_follow;
                    return resolve(user_edge_follow);
                } else {
                    reject(new Error('Error scraping user following init'));
                }
            });
        });
}

exports.scrapeUserFollowersOthers = function(url) {
    return new Promise(function(resolve, reject) {
        if(!url) {
            return reject(new Error('Argument "url" must be specified'));
        }

        var options = {        
            url: url,
            method: 'GET',
            headers: {
                'Cookie': settings.cookie
            }
        };

        request(options, function(err, response, body) {
            if(err) {
                reject(new Error('Error while retrieve data user followers'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var jsonData = scrapeOthers(body);

            if(jsonData.data && jsonData.data.user && jsonData.data.user.edge_followed_by) {
                return resolve(jsonData);
            } else {
                reject(new Error('Error scraping user followers'));
            }
        })
    });
}

exports.scrapeUserFollowingOthers = function(url) {
    return new Promise(function(resolve, reject) {
        if(!url) {
            return reject(new Error('Argument "url" must be specified'));
        }

        var options = {        
            url: url,
            method: 'GET',
            headers: {
                'Cookie': settings.cookie
            }
        };

        request(options, function(err, response, body) {
            if(err) {
                reject(new Error('Error while retrieve data user following'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var jsonData = scrapeOthers(body);

            if(jsonData.data && jsonData.data.user && jsonData.data.user.edge_follow) {
                return resolve(jsonData);
            } else {
                reject(new Error('Error scraping user following'));
            }
        })
    });
}


exports.deepScrapeTagPage = function(tag) {
    return new Promise(function(resolve, reject){
        exports.scrapeTag(tag).then(function(tagPage){
            return Promise.map(tagPage.medias, function(media, i, len) {
                return exports.scrapePostCode(media.shortcode).then(function(postPage){
                    tagPage.medias[i] = postPage;
                    if (postPage.location != null && postPage.location.has_public_page) {
                        return exports.scrapeLocation(postPage.location.id).then(function(locationPage){
                            tagPage.media[i].location = locationPage;
                        })
                        .catch(function(err) {
                            console.log("An error occurred calling scrapeLocation inside deepScrapeTagPage" + ":" + err);
                        });
                    }
                })
                .catch(function(err) {
                    console.log("An error occurred calling scrapePostPage inside deepScrapeTagPage" + ":" + err);
                });
            })
            .then(function(){ resolve(tagPage); })
            .catch(function(err) {
                console.log("An error occurred resolving tagPage inside deepScrapeTagPage" + ":" + err);
            });
        })
        .catch(function(err) {
                console.log("An error occurred calling scrapeTagPage inside deepScrapeTagPage" + ":" + err);
        });        
    });
};

exports.scrapeTag = function(tag) {
    return new Promise(function(resolve, reject){
        if (!tag) return reject(new Error('Argument "tag" must be specified'));
          var options = {
            url: listURL + tag,
            headers: {
              'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4'
            }
          };
        request(options, function(err, response, body){
            if (err) return reject(err);

            var data = scrape(body);
            var media = data.entry_data && data.entry_data.TagPage && data.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media;

            if (data && media) {
                var edges = media.edges;

                async.waterfall([
                    (callback)=>{
                        var medias = [];
                         edges.forEach((post)=>{
                            medias.push(exports.scrapePostData(post))
                        });
                         callback(null, medias);
                    }    
                ], (err, results)=>{
                        resolve({
                            total : results.length,
                            medias : results
                        })   
                })

            }
            else {
                reject(new Error('Error scraping tag page "' + tag + '"'));
            }
        })
    });
};

exports.scrapePostData = function(post) {
    return {
        media_id : post.node.id,
        shortcode : post.node.shortcode,
        text : post.node.edge_media_to_caption.edges[0] && post.node.edge_media_to_caption.edges[0].node.text,
        comment_count : post.node.edge_media_to_comment.count,
        like_count : post.node.edge_liked_by.count,
        display_url : post.node.display_url,
        owner_id : post.node.owner.id,
        date : post.node.taken_at_timestamp,
        thumbnail : post.node.thumbnail_src,
        thumbnail_resource : post.node.thumbnail_resources
    }
}

exports.scrapePostDataOthers = function(post) {
    return {
        media_id : post.node.id,
        shortcode : post.node.shortcode,
        text : post.node.edge_media_to_caption.edges[0] && post.node.edge_media_to_caption.edges[0].node.text,
        comment_count : post.node.edge_media_to_comment.count,
        like_count : post.node.edge_media_preview_like.count,
        display_url : post.node.display_url,
        owner_id : post.node.owner.id,
        date : post.node.taken_at_timestamp,
        thumbnail : post.node.thumbnail_src,
        thumbnail_resource : post.node.thumbnail_resources
    }
}

exports.scrapePostCode = function(code) {
    return new Promise(function(resolve, reject){
        if (!code) return reject(new Error('Argument "code" must be specified'));

        request(postURL + code, function(err, response, body){
            var data = scrape(body);
            if (data && data.entry_data && 
                data.entry_data.PostPage[0] && 
                data.entry_data.PostPage[0].graphql && 
                data.entry_data.PostPage[0].graphql.shortcode_media) {
                resolve(data.entry_data.PostPage[0].graphql.shortcode_media); 
            }
            else {
                reject(new Error('Error scraping post page "' + code + '"'));
            }
        });
    });
}

exports.scrapeLocation = function(id) {
    return new Promise(function(resolve, reject){
        if (!id) return reject(new Error('Argument "id" must be specified'));
        
        request(locURL + id, function(err, response, body){
            var data = scrape(body);

            if (data && data.entry_data && 
                data.entry_data.LocationsPage[0] && 
                data.entry_data.LocationsPage[0].location) {
                resolve(data.entry_data.LocationsPage[0].location);
            }
            else {
                reject(new Error('Error scraping location page "' + id + '"'));
            }
        });
    });
}
// womensbest
// liviaandradereal
// daherthaisa
// milculos ***
// diablitasvip ***
// hotdiva ***
// reinasperversas***
// amazing.chicks *******
// desireangelz ****
// daniellachavezofficial
exports.saveMedias = function(mediaUrl, saveTo, filename) {
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

exports.checkDirectorySync = function(directory) {
    try {
        fs.statSync(directory);
    } catch(e) {
        fs.mkdirSync(directory);
    }
};

exports.checkDirectory = function(directory, callback) {  
    fs.stat(directory, function(err, stats) {
      //Check if error defined and the error code is "not exists"
      if (err && err.errno === 34) {
        //Create the directory, call the callback.
        fs.mkdir(directory, callback);
      } else {
        //just in case there was a different error:
        callback(err)
      }
    });
}

exports.searchFromInstagram = function(query) {
    return new Promise(function(resolve, reject) {
        if (!query) {
            return reject(new Error('Argument "query" must be specified'));
        }
        var q = query.replace(' ', '+');
        var url = `https://www.instagram.com/web/search/topsearch/?context=blended&query=${q}&rank_token=0.7859078765611462`; //0.31090695971357807`;
        request(url, function(error, response, body) {
            if(error) {
                return reject(new Error('Error while retrieve data'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }            
            var json = JSON.parse(body);
            return resolve(json);
        })
    });
}


var scrape = function(html) {
    try {
        var dataString = html.match(dataExp)[1];
        var json = JSON.parse(dataString);        
    }
    catch(e) {
        if (process.env.NODE_ENV != 'production') {
            console.error('The HTML returned from instagram was not suitable for scraping');
        }
        return null
    }

    return json;
}

var scrapeOthers = function(html) {        
    try {
        var json = JSON.parse(html);        
    }
    catch(e) {
        if (process.env.NODE_ENV != 'production') {
            console.error('The HTML returned from instagram was not suitable for scraping');
        }
        return null
    }

    return json;
}

var parseCookies = function(response, userId) {
    var rawCookies = response.headers["set-cookie"];
    var textCookie = '';
    var cookies = {};
    cookies.shbid = 14130;
    cookies.ds_user_id = userId;
    cookies.fbm_124024574287414 = 'base_domain=.instagram.com';    
    
    rawCookies.forEach(function(cookie) {        
        var parts = cookie.match(/(.*?)=(.*)$/)        
        cookies[ parts[1].trim() ] = (parts[2].split(';')[0] || '').trim();        
    });
        
    for (var key in cookies) {
        if (cookies.hasOwnProperty(key)) {
            textCookie += `${key}=${cookies[key]}; `    
        }
    }    
    return textCookie;
}