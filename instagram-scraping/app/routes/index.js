var express = require('express');
var crypto = require('crypto');
var instagram = require('../controllers/instagram');
var fs = require('fs');

var router = express.Router();

router.get('/', (req, res, next) => {
    res.render('index', {
        title: ' Home - Instagram Scraping'
    });
});

/*
o que quero fazer é:
    * no momento em que o usuário digita o username do instagram na caixa de texto e clica no botão, a aplicação pega todas as fotos desse usuário e automaticamente salva no computador usando a biblioteca (modulo) FS.
    * a primeira busca é feita direto na url do usuario: https://www.instagram.com/nome-do-usuario/ . O json retornado nessa busca fornece um end_cursor que é usado para a proxima busca.
    * para a proxima busca, usa-se a url: https://www.instagram.com/graphql/query/?query_hash=bd0d6d184eefd4d0ce7036c11ae58ed9&variables={"id":"2036299","first":12,"after":"AQBrd06XttD1FC-UNkb2Yd0mSjv6Tz20kqIWGJHkAsdCTfxz0RiHSEPNp16Q8RcS8mJFFq80ww6LzGdCsy2OqQk6HsGDvDu_ZTWnY7N193cp7w"}
    * essa parte deve ser encodada {"id":"2036299","first":12,"after":"AQBrd06XttD1FC-UNkb2Yd0mSjv6Tz20kqIWGJHkAsdCTfxz0RiHSEPNp16Q8RcS8mJFFq80ww6LzGdCsy2OqQk6HsGDvDu_ZTWnY7N193cp7w"}
    * id: id do usuario do instagram; 
    * first: qtde de post na consulta; 
    * after: é o valor do end_cursor retornado no json da consulta anterior
    * a url fica da seguinte forma: https://www.instagram.com/graphql/query/?query_hash=1a333188e338d9b431cb80abd47fb26d&variables=%7B%22id%22%3A%222036299%22%2C%22first%22%3A12%2C%22after%22%3A%22AQDm5UO1PON1oqnzHptvWXAYnZy5VS6TZfB-EH5k1bYVUTiGB586uB0yUTJgZyUulPmzk4CBBkm2rPBg1eaLulDLO_jGYf3xMAjcU4Pu2aWMlg%22%7D
      var url = 'https://www.instagram.com/graphql/query/?query_hash=bd0d6d184eefd4d0ce7036c11ae58ed9&variables=%7B%22id%22%3A%22' + userId + '%22%2C%22first%22%3A12%2C%22after%22%3A%22' + end_cursor + '%22%7D'; 
    * o parametro de signature é var data = `${rhx_gis}:{"id":"${userId}","first":12,"after":"${end_cursor}"}`;  criptografado em hash md5
      var signature = crypto.createHash('md5').update(data).digest("hex");
    * rhx_gis é o valor do json retornado na primeira busca que é na url do usuario
    * 
    * Estou usando um cookie hardcode e está funfando kkkkkkkkk
    * 
    * Então a idéia é pegar o total de posts do usuario informado no json da primeira busca feita na url do usuário e para usar em um loop para as proximas consultas,
      pegar o valor do end_cursor e usar na url para as demais consultas (o valor do end_cursor retornado pela consulta deve ser usado na proxima consulta e assim por diante até o has_next_page retornar false).


    * Não quero usar o botão "Mais" que está na tela, ele é apenas um teste para request das proximas consultas. Quero que tudo seja feito clicando no botão de pesquisa
*/
router.get('/getInstagramInit/:username', (req, res, next) => {
    var username = req.params.username;
    instagram.scrapeUserPageInit(username).then((data) => {
        res.status(200).json(data);
    }).catch(err => {
      res.status(404).json({ message: 'Usuário não encontrado: ' + err });
    });
})

router.get('/getInstagramMore/:end_cursor/:rhx_gis/:csrf_token/:userId', (req, res, next) => {
    
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    var first = '100';
    var after = req.params.end_cursor;
    var rhx_gis = req.params.hrx_gis;
    var csrf_token = req.params.csrf_token;
    var userId = req.params.userId;
    var data = `${rhx_gis}:{"id":"${userId}","first":${first},"after":"${after}"}`; 
    var signature = crypto.createHash('md5').update(data).digest("hex");
    var url = url = 'https://www.instagram.com/graphql/query/?query_hash=bd0d6d184eefd4d0ce7036c11ae58ed9&variables=%7B%22id%22%3A%22' + userId + '%22%2C%22first%22%3A'+ first +'%2C%22after%22%3A%22' + after + '%22%7D';
    
    instagram.scrapeUserPageOther(url, signature).then((data) => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(404).json({ message: 'Erro ao retornar os dados' })
    });
})

router.get('/downloadFotos', (req, res, next) => {
    var data = req.query.medias;
    var username = req.query.username
    var mediasUrl = JSON.parse(data); 
    
    // cria o diretorio se ele não existir    
    var pathDir = `C:/Users/rfrancisco/Pictures/_/instapics_downloaded/${username}`;
    instagram.checkDirectorySync(pathDir);
    
    mediasUrl.forEach(mediaUrl => {
        
        var urlFile = mediaUrl.split('https://scontent-gru2-2.cdninstagram.com/vp/')[1].replace('…', '_');
        var splits = urlFile.split('/');        
        var filename = '';
        
        if(mediaUrl.indexOf('.mp4') > 0) {
            filename = `${splits[0]}.mp4`;
        } else {
            filename = `${splits[0]}.jpg`;
        }

        instagram.saveMedias(mediaUrl, pathDir, filename).then((data) => {
            
        })
        .catch(err => res.status(400).json({ message: 'Erro ao tentar salvar as medias' }));
    }); //musclesbuilder1

    res.status(200).json({data: 'sucesso'});
});

router.get('/downloadFotosDotNet', (req, res, next) => {
    var data = req.query.medias;
    var mediasUrl = JSON.parse(data);    
    mediasUrl.forEach(mediaUrl => {
        
        var urlFile = mediaUrl.split('https://scontent-gru2-2.cdninstagram.com/vp/')[1].replace('…', '_');
        var splits = urlFile.split('/');
        var filename = splits[4];

        instagram.saveMedias(mediaUrl, filename).then((data) => {
            
        })
    });

    res.status(200).json({data: 'sucesso'});
});


router.get('/search-from-instagram', (req, res, next) => {
    res.render('searchInstagram', {
        title: ' Pesquisar no Instagram - Instagram Scraping'
    });
})

router.get('/getInstagramTopSearch/:query', (req, res, next) => {
    var query = req.params.query;

    instagram.searchFromInstagram(query).then(function(data) {        
        res.status(200).json(data);
    }).catch(err => { res.status(400).json({ message: 'Não foi possivel retornar os dados' }) })
})

router.get('/user-details/:username', (req, res, next) => {
    var username = req.params.username;

    var jsonReturn = {};
    
    instagram.scrapeUserPageInit(username)
        .then((data) => {

            jsonReturn.user = data.user;
            var pk = data.user.id;

            // carregar os stories recentes
            instagram.scrapeLastUserStories(pk).then((stories) => {
                jsonReturn.stories = stories;

                // carregar os seguidores iniciais
                instagram.scrapeUserFollowersInit(pk)
                    .then((followersInit) => {
                        jsonReturn.followersInit = followersInit;

                        // carrega os seguindo iniciais
                        instagram.scrapeUserFollowingInit(pk)
                            .then((followingInit) => {
                                jsonReturn.followingInit = followingInit;

                                res.render('user-details', {
                                    title: `${data.user.full_name} (@${ data.user.username }) • Fotos e vídeos do Instagram`,
                                    data: jsonReturn
                                });
                            })
                            .catch(err => res.status(400).json({ message: 'Não foi possivel retornar os dados' }));
                    })
                    .catch(err => res.status(400).json({ message: 'Não foi possivel retornar os dados' }));
            })
            .catch(err => {
                res.status(404).json({ message: 'Usuário não encontrado: ' + err })
            });
        })
        .catch(err => {
            res.status(404).json({ message: 'Usuário não encontrado: ' + err })
        });
});

router.get('/getUserFollowersInit/:userId', (req, res, next) => {
    var userid = req.params.userId;
    instagram.scrapeUserFollowersInit(userid)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch(err => res.status(400).json({ message: 'Não foi possivel retornar os dados' }));
});

router.get('/getUserFollowingInit/:userId', (req, res, next) => {
    var userid = req.params.userId;
    instagram.scrapeUserFollowingInit(userid)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch(err => res.status(400).json({ message: 'Não foi possivel retornar os dados' }));
});

router.get('/getUserFollowersOthers/:userId', (req, res, next) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    var userId = req.params.userId;
    var end_cursor = req.query.end_cursor;
    var count = 50;
    var url = 'https://www.instagram.com/graphql/query/?query_hash=149bef52a3b2af88c0fec37913fe1cbc&variables=%7B%22id%22%3A%22' + userId + '%22%2C%22first%22%3A' + count + '%2C%22after%22%3A%22' + end_cursor + '%22%7D';

    instagram.scrapeUserFollowersOthers(url)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch(err => res.status(400).json({ message: 'Erro ao trazer mais seguidores'}));
});

router.get('/getUserFollowingOthers/:userId', (req, res, next) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    var userId = req.params.userId;
    var end_cursor = req.query.end_cursor;
    var count = 50;
    var url = 'https://www.instagram.com/graphql/query/?query_hash=9335e35a1b280f082a47b98c5aa10fa4&variables=%7B%22id%22%3A%22' + userId + '%22%2C%22first%22%3A' + count + '%2C%22after%22%3A%22' + end_cursor + '%22%7D';

    instagram.scrapeUserFollowingOthers(url)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch(err => res.status(400).json({ message: 'Erro ao trazer mais seguindo'}));
});

module.exports = router;


/*
https://www.instagram.com/graphql/query/?query_hash=45246d3fe16ccc6577e0bd297a5db1ab&variables=%7B%22reel_ids%22%3A%5B%22270534455%22%5D%2C%22tag_names%22%3A%5B%5D%2C%22location_ids%22%3A%5B%5D%2C%22highlight_reel_ids%22%3A%5B%5D%2C%22precomposed_overlay%22%3Afalse%7D
query_hash: 45246d3fe16ccc6577e0bd297a5db1ab
variables: {"reel_ids":["270534455"],"tag_names":[],"location_ids":[],"highlight_reel_ids":[],"precomposed_overlay":false}
*/