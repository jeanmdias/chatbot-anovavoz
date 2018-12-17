var assert = require('assert');
var async = require('async');

var db = require('../models/db');
var user = require('../models/user');
var situation = require('../models/situation');
var politician = require('../models/politician');
var service = require('../models/service');

var facebook = require('../controllers/facebook');
var utilities = require('../controllers/utilities');


exports.ranking = function(recipientID, messageFromWatson, oneService, callback) {
  var ranking;
  var countAll = 0;
  var element = [];

  async.series([
    function(callback) {
      db.connect(function(err) {
        assert.equal(null, err);
        callback();
      });          
    },

    function(callback) {
      db.get().collection("followers_"+oneService.name).find().count(function(err, res) {
        countAll = res;
        callback();
      });
    },

    function(callback) {
      db.get().collection("followers_"+oneService.name).aggregate([
        { $group: 
          { _id: "$code", 
            count: { $sum: 1 }
          }
        },
        {
          $sort: {count: -1}
        },
        { $limit: 4 }
      ]).toArray(function(err, res) {
        assert.equal(err, null);
        ranking = res;
        callback();
      });
    },

    function(callback) {
      async.forEachLimit(ranking, 1, function(politician, callback) {
        db.get().collection('politicians_'+oneService.name).findOne({code: politician._id}, function(err, res) {
          assert.equal(null, err);
          
          var document = res;
          var url = document.webpage.replace("http:", "https:");
          var image_url = document.picture.replace("http:", "https:");
          var treatment = oneService.short;

          if (document.state) {
            var state = document.state;
          } else {
            var state = '';
          }

          var perc = politician.count * 100 / countAll;
          console.log(politician.count);

          var doc = {
                  title: treatment+' '+document.name + " " + perc.toFixed(2) + "%",
                  image_url: image_url,
                  subtitle: document.acronym_political_party+'-'+state,
                  default_action: {
                    type: 'web_url',
                    url: url,
                    messenger_extensions: true,
                    webview_height_ratio: 'tall',
                    fallback_url: url
                  }
                }


          element.push(doc);    
          callback();
        }) 
      }, function() {

        if (element.length == 1) {
          element.push({
            title: 'Continue acompanhando nosso ranking de seguidores.',
            subtitle: 'No futuro, mais informações!',
          });          
        }

        data = {
          attachment: {
            type: "template",
            payload: {
              template_type: "list",
              top_element_style: "compact",
              elements: element
            }
          }
        }
        callback();
      });
    },

    function(callback) {
      if (messageFromWatson) {
        facebook.sendResponse(recipientID, messageFromWatson, function(res) {
          callback();
        });        
      }
    },

    function(callback) {
      if (data && messageFromWatson) {
        facebook.sendList(recipientID, data, function(res) {
          callback();
        });
      } else {
        callback();
      }
    },

    function(callback) {
      if (messageFromWatson) {
        facebook.buttonsDefault(recipientID, function(res) {
          callback();
        })
      }
    }

  ], function() {
    db.close( function(err) {
      assert.equal(null, err);
      callback(ranking);
    });
  });
}


exports.listWhoAmIFollowing = function(recipientID, messageFromWatson, callback) {
  
  var services;
  var total = 0;

  async.series([
    function(callback) {
      db.connect(function(err) {
        assert.equal(null, err);
        callback();
      });          
    },

    function(callback) {
      facebook.sendResponse(recipientID, messageFromWatson, function(res) {
        callback();
      });
    },

    function(callback) {
      situation.set(recipientID, 'list_who_am_i_following', '', function(res) {
        callback();
      });
    },

    function(callback) {
      service.get(function(res) {
        services = res;
        callback();
      })
    },

    function(callback) {
      listAll(services, recipientID, function(res) {
        callback();
      })
    },

    function(callback) {
      facebook.buttonsDefault(recipientID, function(res) {
        callback();
      })
    }

  ], function() {
    db.close( function(err) {
      assert.equal(null, err);
      callback(true);
    });
  });
}


exports.waitingName = function(recipientID, messageFromWatson, entities, situation_now, callback) { 

  var serviceAvailable = '';

  async.series([
    function(callback) {
      db.connect(function(err) {
        assert.equal(null, err);
        callback();
      });          
    },

    function(callback) {
      service.available(situation_now.menu+'_'+situation_now.intent, function(res) {
        serviceAvailable = res;
        callback();
      })
    },

    function(callback) {
      politician.isReturnEntity(entities, situation_now, function(result, politicianName) {
        if (result) {
          if (politicianName.length > 1) {
            politician.askWhich(recipientID, politicianName, situation_now, serviceAvailable, function(done) {
              callback();
            });
          } else {
            politician.find(politicianName[0], situation_now, function(res) {
              findUserCode('followers_'+situation_now.intent, recipientID, res.code, function(existDocument) {

                if (situation_now.menu == 'follow') {
                  if (!existDocument) {
                    askConfirmation(recipientID, situation_now.menu, res, serviceAvailable, function(ret) {
                      callback();
                    });
                  } else {
                    messageWarning(recipientID, situation_now.menu, res, serviceAvailable, function(ret) {
                      callback();
                    });
                  }              
                }

                if (situation_now.menu == 'unfollow') {
                  if (existDocument) {
                    askConfirmation(recipientID, situation_now.menu, res, serviceAvailable, function(ret) {
                      callback();
                    });
                  } else {
                    messageWarning(recipientID, situation_now.menu, res, serviceAvailable, function(ret) {
                      callback();
                    });
                  }
                }
              });
            });
          }
        } else {
          notFound(recipientID, situation_now, function(result) {
            if (!result) {
              facebook.sendResponse(recipientID, messageFromWatson, function(result) {
                callback(true);
              });
            } else {
              callback(true);
            }
          });
        }
      });
    }

  ], function() {
    db.close( function(err) {
      assert.equal(null, err);
      callback(true);
    });
  });
}


exports.waitingConfirmation = function(recipientID, entities, messageFromWatson, situation_now, callback) {

  async.series([
    function(callback) {
      db.connect(function(err) {
        assert.equal(null, err);
        callback();
      });          
    },

    function(callback) {
      row = entities[0]
      if (row && row.entity) {      
        if (row.entity == 'yes') {

          async.series([
            function(callback) {
              if (situation_now.menu == 'follow') {
                insertFollower('followers_'+situation_now.intent, situation_now.document.code, recipientID, function(res) {
                  callback();
                })
              } else if (situation_now.menu == 'unfollow') {
                deleteFollower('followers_'+situation_now.intent, situation_now.document.code, recipientID, function(res) {
                  callback();
                })
              } else {
                callback();
              }
            },

            function(callback) {
              facebook.sendResponse(recipientID, messageFromWatson, function(res) {
                callback();
              })
            },

            function(callback) {
              facebook.buttonsDefault(recipientID, function(res) {
                callback();
              })
            }
          ], function() {
            callback();
          });
        } else {
          callback();
        }
      }      
    }

  ], function() {
    db.close( function(err) {
      assert.equal(null, err);
      callback(true);
    });
  });
}


exports.follow = function(recipientID, messageFromWatson, serv, serviceFind, callback) {
  var totalFollowers;
  var collection;
  var model;

  async.series([

    function(callback) {
      db.connect(function(err) {
        assert.equal(null, err);
        callback();
      });          
    },

    function(callback) {
      i = serv.indexOf('_');
      model = serv.substring(i + 1);
      collection = 'followers_' + serv.substring(i + 1);
      callback()
    },

    function(callback) {
      situation.set(recipientID, 'follow', model, function(res) {
        callback();
      });
    },

    function(callback) {
      db.get().collection(collection).find({ user: recipientID }).toArray(function(err, res) {
        totalFollowers = res.length;
        callback();
      });
    },

    function(callback) {
      if (serviceFind.followEntity == false) {
        if (totalFollowers >= 4) {
          var msg = "No momento você esta seguindo o número máximo permitido. Em breve, você poderá seguir mais.";
          facebook.sendResponse(recipientID, msg, function(result) {
            facebook.buttonsDefault(recipientID, function(res) {
              situation.set(recipientID, '', '', function(res) {
                callback();
              });
            });
          });
        } else  {
          facebook.sendResponse(recipientID, messageFromWatson, function(result) {
            situation.setAction(recipientID, 'waiting_name', 1, null, function(res) {
              callback();
            });
          });        
        }        
      } else {
        //Insere seguidores de prefeitura

        if (totalFollowers > 0) {
          var msg = "Você esta seguindo.";
          facebook.sendResponse(recipientID, msg, function(result) {
            facebook.buttonsDefault(recipientID, function(res) {
              situation.set(recipientID, '', '', function(res) {
                callback();
              });
            });
          });
        } else {
          insertFollower(collection, null, recipientID, function(res) {

            let element = [];
            let data;

            element.push({
              title: serviceFind.title,
              image_url: serviceFind.image,
              subtitle: 'Contratos e Licitações',
              default_action: {
                type: 'web_url',
                url: 'https://www.anovavoz.com.br',
                messenger_extensions: true,
                webview_height_ratio: 'tall',
                fallback_url: 'https://www.anovavoz.com.br'
              }
            });    

            element.push({
              title: 'Seguindo ' + serviceFind.city + ' !!',
              subtitle: messageFromWatson
            });          


            data = {
              attachment: {
                type: "template",
                payload: {
                  template_type: "list",
                  top_element_style: "compact",
                  elements: element,
                }
              }
            }

            facebook.sendList(recipientID, data, function(res) {
              facebook.buttonsDefault(recipientID, function(res) {
                situation.set(recipientID, '', '', function(res) {
                  callback();
                });
              });
            });
          });
        }
      }
    }

  ], function() {
    db.close( function(err) {
      assert.equal(null, err);
      callback(true);
    });
  });
}


exports.unfollow = function(recipientID, messageFromWatson, serv, serviceFind, callback) {
  var collection;
  var model;
  var totalFollowers;

  async.series([

    function(callback) {
      db.connect(function(err) {
        assert.equal(null, err);
        callback();
      });          
    },

    function(callback) {
      i = serv.indexOf('_');
      model = serv.substring(i + 1);
      collection = 'followers_' + serv.substring(i + 1);
      callback()
    },

    function(callback) {
      situation.set(recipientID, 'unfollow', model, function(res) {
        callback();
      });
    },

    function(callback) {
      db.get().collection(collection).find({ user: recipientID }).toArray(function(err, res) {
        totalFollowers = res.length;
        callback();
      });
    },

    function(callback) {
      if (serviceFind.followEntity == false) {      
        if (totalFollowers == 0) {
          var msg = "No momento você NÃO esta seguindo ninguém.";
          facebook.sendResponse(recipientID, msg, function(res) {
            facebook.buttonsDefault(recipientID, function(res) {
              situation.set(recipientID, '', '', function(res) {
                callback();
              });
            });
          });
        } else {
          facebook.sendResponse(recipientID, messageFromWatson, function(result) {
            situation.setAction(recipientID, 'waiting_name', 1, null, function(res) {
              callback();
            });
          });        
        }
      } else {
        if (totalFollowers == 0) {
          var msg = "No momento você NÃO segue esse serviço.";
          facebook.sendResponse(recipientID, msg, function(res) {
            facebook.buttonsDefault(recipientID, function(res) {
              situation.set(recipientID, '', '', function(res) {
                callback();
              });
            });
          });
        } else {
          //Unfollow Prefeituras
          var msg = "Você NÃO segue mais esse serviço.";
          deleteFollower(collection, null, recipientID, function(res) {
            facebook.sendResponse(recipientID, msg, function(res) {
              facebook.buttonsDefault(recipientID, function(res) {
                situation.set(recipientID, '', '', function(res) {
                  callback();
                });
              });
            });
          })
        }
      }
    },
  ], function() {
    db.close( function(err) {
      assert.equal(null, err);
      callback(true);
    });
  });
}


function insertFollower(collection, code, user, callback) {
  db.get().collection(collection).insertOne({
    code: code,
    user: user
  },
    function(err, result) {
      assert.equal(err, null);
      callback(true);
    }
  )
}

function deleteFollower(collection, code, user, callback) {
  db.get().collection(collection).deleteOne({code: code, user: user},
    function(err, result) {
      assert.equal(err, null);
      callback(true);
    }
  )
}


exports.findFollowers = function(collection, callback) {
  try {
    db.get().collection('users').aggregate(
      [
        {
          $lookup: {
            from: collection,
            localField: "code",
            foreignField: "user",
            as: "user_followers"
          }
        }
      ]
    ).toArray(function(err, docs) {
      assert.equal(null, err);
      callback(docs);
    });
  } catch (e) {
    console.log(e);
  }
}


function findUserCode(collection, user, politician, callback) {
  db.get().collection(collection).findOne({user: user, code: politician}, function(err, res) {
    assert.equal(null, err);
    if (res) {
      callback(true);
    } else {
      callback(false);
    }
  })
}


function listAll(services, me, done) {

  var total = 0;
  var oneService;

  async.forEachLimit(services, 1, function(res, callback) {

    var followers_docs;
    var element = [];
    var data;

    oneService = res;
    async.series([

      function(callback) {
        db.get().collection('followers_'+oneService.name).find({user: me}).toArray(function(err, res) {
          assert.equal(null, err);
          followers_docs = res;
          total = total + followers_docs.length;
          callback();
        });
      },

      function(callback) {
        if (followers_docs.length > 0) {

          var city = '';
          if (oneService.city.length > 0) {city = ' - '+oneService.city}

          if (followers_docs.length == 1) {var message = 'Você segue 1 '+oneService.singular+city+'.'};
          if (followers_docs.length >  1) {var message = 'Você segue '+followers_docs.length.toString()+' '+oneService.plural+city+'.'};

          facebook.sendResponse(me, message, function(res) {
            callback();
          });            
        } else {
          callback()
        }
      },

      function(callback) {
        if (followers_docs.length > 0 && oneService.followEntity == false) {
          async.forEach( followers_docs, function(follower, callback) {
            db.get().collection('politicians_'+oneService.name).findOne({code: follower['code']}, function(err, res) {
              assert.equal(null, err);
              utilities.getElement(res, oneService, function(res) {
                element.push(res);    
                callback();
              })
            }) 
          }, function() {

            if (element.length == 1) {
              element.push({
                title: 'Continue acompanhando os parlamentares.',
                subtitle: 'No futuro, mais informações!',
              });          
            }

            data = {
              attachment: {
                type: "template",
                payload: {
                  template_type: "list",
                  top_element_style: "compact",
                  elements: element
                }
              }
            }
            callback();
          });

        } else {
          callback();
        }
      },

      function(callback) {
        if (data) {
          facebook.sendList(me, data, function(res) {
            callback();
          });
        } else {
          callback();
        }
      }
    ], function() {
      callback();
    });
  }, function() {
    if (total == 0) {
      facebook.sendResponse(me, 'No momento você não segue nenhum serviço.', function(res) {
        done();
      });            
    } else {
      done()
    }
  });
}


function askConfirmation(recipientID, menu, document, serviceAvailable, callback) {
  var element = [];
  var data;

  if (menu == 'unfollow') {
    title = 'Não quero mais acompanhar.';
    subtitle = 'Não tenho interesse em suas votações.';
  } else if (menu == 'follow') {
    title = 'Sim, quero acompanhar !!';
    subtitle = 'E receber informações sobre suas votações.';
  }

  element.push({
    title: title,
    subtitle: subtitle,
  });          

  utilities.getElement(document, serviceAvailable, function(res) {
    element.push(res);    
  })

  var data = {
    attachment: {
      type: "template",
      payload: {
        template_type: "list",
        top_element_style: "compact",
        elements: element,
      }
    }
  }

  var quick_replies = {
    text: "Confirmar?",
    quick_replies:[
      {
        content_type:"text",
        title: "Confirmar",
        payload:"YES"
      },
      {
        content_type: "text",
        title: "Não",
        payload: "NO"
      }
    ]
  }

  async.series([
    function(callback) {
      situation.setAction(recipientID, 'waiting_confirmation', 0, document, function(res) {
        callback();
      });
    },

    function(callback) {
      facebook.sendList(recipientID, data, function(res) {
        callback();
      });
    },

    function(callback) {
      facebook.sendList(recipientID, quick_replies, function(res) {
        callback();
      });
    }
  ]);
}


function notFound(recipientID, situation_now, callback) {
  var result = false;
  if (  situation_now.menu == 'follow' &&
        situation_now.action == 'waiting_name' ) {
  
    if (situation_now.times == 3) {
      facebook.sendResponse(recipientID, "O Parlamentar não existe aqui nas minhas anotações, desculpe.", function(result) {
        facebook.buttonsDefault(recipientID, function(result) {
          callback(false);
        });
      });
    } else {
      situation.addTimes(recipientID, function(res) {
        facebook.sendResponse(recipientID, "Não encontrei o nome que você digitou. Digite novamente ou LISTA ou SAIR, por favor?", function(result) {
          callback(true);
        });      
      });
    }

  } else if ( situation_now.menu == 'unfollow' &&
              situation_now.action == 'waiting_name') {
    facebook.sendResponse(recipientID, "Não encontrei o Parlamentar, desculpe.", function(result) {
      facebook.buttonsDefault(recipientID, function(result) {
        callback(result);
      });
    });
  } else {
    callback(result);
  }
}


function messageWarning(recipientID, menu, document, serviceAvailable, callback) {
  var element = [];
  var data;
  var title = '';
  var subtitle = '';

  if (menu == 'unfollow') {
    title = 'NÃO está na sua lista!!';
    subtitle = 'Esse parlamentar você ainda não segue.'
  } else if (menu == 'follow') {
    title = 'Já está na sua lista!!',
    subtitle = 'E irá receber informações sobre suas votações e despesas.'    
  }

  element.push({
    title: title,
    subtitle: subtitle,
  });          

  utilities.getElement(document, serviceAvailable, function(res) {
    element.push(res);    
  })

  var data = {
    attachment: {
      type: "template",
      payload: {
        template_type: "list",
        top_element_style: "compact",
        elements: element,
      }
    }
  }

  facebook.sendList(recipientID, data, function(res) {
    facebook.buttonsDefault(recipientID, function(res) {
      callback();
    });
  });
}


