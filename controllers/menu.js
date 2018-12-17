var service = require('../models/service');
var situation = require('../models/situation');
var follower = require('../models/follower');

var facebook = require('../controllers/facebook');

var async = require('async');

exports.follow = function(recipientID, messageFromWatson, entities, callback) {

  var _follow_congress = false;
  var _follow_county_chamber = false;
  var _follow_cities = false;
  var _follow_service = false;
  var _service;
  var _service_all;

  async.forEach(entities, function(row, callback) {
    if (row && row.entity) {
      if (row.entity == 'services' && row.value == 'congress') {
        _follow_congress = true;
        callback();
      }

      else if (row.entity == 'services' && row.value == 'counties_chamber') {
        _follow_county_chamber = true;
        callback();
      } 

      else if (row.entity == 'services' && row.value == 'cities') {
        _follow_cities = true;
        callback();
      } 

      else if (row.entity == 'services') {
        service.available('follow_'+row.value, function(res) {
          if (res) {
            _follow_service = true;
            _service = 'follow_'+row.value;
            _service_all = res;
            callback();
          } else {
            callback();
          }
        });
      }

      else {
        callback();
      }

    } else {
      callback();
    }
  });

  if (_follow_congress) {
    followCongress(recipientID, messageFromWatson, function(res) {callback(true)})
  } 
  
  else if (_follow_county_chamber) {
    followCountiesChamber(recipientID, messageFromWatson, function(res) {callback(true)})
  } 

  else if (_follow_cities) {
    followCities(recipientID, messageFromWatson, function(res) {callback(true)})
  } 

  else if (_follow_service) {
    follower.follow(recipientID, messageFromWatson, _service, _service_all, function(res) {callback(true)});      
  } 

  else {
    var quick_replies = {
      text: messageFromWatson,
      quick_replies:[
        {
          content_type:"text",
          title: "Congresso Nacional",
          payload:"FOLLOW_CONGRESS"
        },
        {
          content_type: "text",
          title: "Câmaras Municipais",
          payload: "FOLLOW_COUNTIES_CHAMBER"
        },
        {
          content_type: "text",
          title: "Prefeituras",
          payload: "FOLLOW_CITIES"
        },
        {
          content_type: "text",
          title: "IFC/CL Distrito Federal",
          payload: "FOLLOW_DF_DISTRITO_FEDERAL"
        }
      ]
    }
    situation.set(recipientID, 'follow', '', function(res) {
      facebook.sendList(recipientID, quick_replies, function(res) {
        callback(true);
      });
    });
  }
}

function followCongress(recipientID, messageFromWatson, callback) {
  var quick_replies = {
    text: messageFromWatson,
    quick_replies:[
      {
        content_type:"text",
        title: "Senadores",
        payload:"FOLLOW_SENATOR"
      },
      {
        content_type: "text",
        title: "Dep Federais",
        payload: "FOLLOW_DEP_FEDERAL"
      }
    ]
  }
  situation.set(recipientID, 'follow', 'congress', function(res) {
    facebook.sendList(recipientID, quick_replies, function(res) {
      callback(true);
    });
  });
}

function followCountiesChamber(recipientID, messageFromWatson, callback) {
  var quick_replies = {
    text: messageFromWatson,
    quick_replies:[
      {
        content_type: "text",
        title: "Porto Alegre",
        payload: "FOLLOW_RS_PORTO_ALEGRE_LEGIS"
      },
      {
        content_type: "text",
        title: "Rio de Janeiro",
        payload: "FOLLOW_RJ_RIO_DE_JANEIRO"
      },
      {
        content_type: "text",
        title: "São Paulo",
        payload: "FOLLOW_SP_SAO_PAULO"
      }
    ]
  }

  situation.set(recipientID, 'follow', 'counties_chamber', function(res) {
    facebook.sendList(recipientID, quick_replies, function(res) {
      callback(true);
    });
  });
}

function followCities(recipientID, messageFromWatson, callback) {
  var quick_replies = {
    text: messageFromWatson,
    quick_replies:[
      {
        content_type: "text",
        title: "Porto Alegre",
        payload: "FOLLOW_RS_PORTO_ALEGRE_EXEC"
      }
    ]
  }
  
  situation.set(recipientID, 'follow', 'cities', function(res) {
    facebook.sendList(recipientID, quick_replies, function(res) {
      callback(true);
    });
  });
}


exports.unfollow = function(recipientID, messageFromWatson, entities, callback) {
  var _unfollow_congress = false;
  var _unfollow_county_chamber = false;
  var _unfollow_service = false;
  var _unfollow_cities = false;
  var _service;
  var _service_find;

  async.forEach(entities, function(row, callback) {
    if (row && row.entity) {
      if (row.entity == 'services' && row.value == 'congress') {
        _unfollow_congress = true;
        callback();
      }

      else if (row.entity == 'services' && row.value == 'counties_chamber') {
        _unfollow_county_chamber = true;
        callback();
      } 

      else if (row.entity == 'services' && row.value == 'cities') {
        _unfollow_cities = true;
        callback();
      } 

      else if (row.entity == 'services') {
        service.available('unfollow_'+row.value, function(res) {
          if (res) {
            _unfollow_service = true;
            _service = 'unfollow_'+row.value;
            _service_find = res;
            callback();
          } else {
            callback();
          }
        });
      }
      else {
        callback();
      }
    } else {
      callback();
    }
  });

  if (_unfollow_congress) {
    unfollowCongress(recipientID, messageFromWatson, function(res) {callback(true)})
  } 
  
  else if (_unfollow_county_chamber) {
    unfollowCountiesChamber(recipientID, messageFromWatson, function(res) {callback(true)})
  } 

  else if (_unfollow_cities) {
    unfollowCities(recipientID, messageFromWatson, function(res) {callback(true)})
  } 

  else if (_unfollow_service) {
    follower.unfollow(recipientID, messageFromWatson, _service, _service_find, function(res) {callback(true)});      
  } 

  else {
    var quick_replies = {
      text: messageFromWatson,
      quick_replies:[
        {
          content_type:"text",
          title: "Congresso Nacional",
          payload:"UNFOLLOW_CONGRESS"
        },
        {
          content_type: "text",
          title: "Câmaras Municipais",
          payload: "UNFOLLOW_COUNTIES_CHAMBER"
        },
        {
          content_type: "text",
          title: "Prefeituras",
          payload: "UNFOLLOW_CITIES"
        },
        {
          content_type: "text",
          title: "IFC/CL Distrito Federal",
          payload: "UNFOLLOW_DF_DISTRITO_FEDERAL"
        }
      ]
    }
    situation.set(recipientID, 'unfollow', '', function(res) {
      facebook.sendList(recipientID, quick_replies, function(res) {
        callback(true);
      });
    });
  }

}

function unfollowCongress(recipientID, messageFromWatson, callback) {
  var quick_replies = {
    text: messageFromWatson,
    quick_replies:[
      {
        content_type:"text",
        title: "Senadores",
        payload:"UNFOLLOW_SENATOR"
      },
      {
        content_type: "text",
        title: "Dep Federais",
        payload: "UNFOLLOW_DEP_FEDERAL"
      }
    ]
  }
  situation.set(recipientID, 'unfollow', 'congress', function(res) {
    facebook.sendList(recipientID, quick_replies, function(res) {
      callback(true);
    });
  });
}

function unfollowCountiesChamber(recipientID, messageFromWatson, callback) {
  var quick_replies = {
    text: messageFromWatson,
    quick_replies:[
      {
        content_type: "text",
        title: "Porto Alegre",
        payload: "UNFOLLOW_RS_PORTO_ALEGRE_LEGIS"
      },
      {
        content_type: "text",
        title: "Rio de Janeiro",
        payload: "UNFOLLOW_RJ_RIO_DE_JANEIRO"
      },
      {
        content_type: "text",
        title: "São Paulo",
        payload: "UNFOLLOW_SP_SAO_PAULO"
      }
    ]
  }

  situation.set(recipientID, 'unfollow', 'counties_chamber', function(res) {
    facebook.sendList(recipientID, quick_replies, function(res) {
      callback(true);
    });
  });
}

function unfollowCities(recipientID, messageFromWatson, callback) {
  var quick_replies = {
    text: messageFromWatson,
    quick_replies:[
      {
        content_type: "text",
        title: "Porto Alegre",
        payload: "UNFOLLOW_RS_PORTO_ALEGRE_EXEC"
      }
    ]
  }

  situation.set(recipientID, 'unfollow', 'counties_chamber', function(res) {
    facebook.sendList(recipientID, quick_replies, function(res) {
      callback(true);
    });
  });
}

exports.start = function(recipientID, messageFromWatson, callback) {
  situation.set(recipientID, 'start', '', function(res) {
    facebook.sendResponse(recipientID, messageFromWatson, function(res) {
      facebook.buttonsDefault(recipientID, function(res) {
        callback(true);
      });
    });
  });
}

exports.leave = function(recipientID, messageFromWatson, callback) {
  situation.set(recipientID, 'leave', '', function(res) {
    facebook.sendResponse(recipientID, messageFromWatson, function(res) {
      facebook.buttonsDefault(recipientID, function(res) {
        callback(true);
      });
    });
  });
}

exports.greeting = function(recipientID, messageFromWatson, callback) {
  situation.set(recipientID, 'greeting', '', function(res) {
    facebook.sendResponse(recipientID, messageFromWatson, function(res) {
      facebook.buttonsDefault(recipientID, function(res) {
        callback(true);
      });            
    });
  });
}

exports.aboutUs = function(recipientID, messageFromWatson, callback) {
  facebook.sendResponse(recipientID, messageFromWatson, function(res) {
    facebook.buttonsDefault(recipientID, function(res) {
      situation.set(recipientID, 'about_us', '', function(res) {
        callback(true);
      });
    });
  });
}

exports.moreButtonsDefault = function(recipientID, callback) {
  var quick_replies = {
    text: "Escolha uma opção, por favor:",
    quick_replies:[
      {
        content_type:"text",
        title: "Rank Senadores",
        payload:"RANKING_SENATOR"
      },
      {
        content_type: "text",
        title: "Rank Dep Federal",
        payload: "RANKING_DEP_FEDERAL"
      }
    ]
  }

  facebook.sendList(recipientID, quick_replies, function(res) {
    situation.set(recipientID, '', '', function(res) {
      callback();
    });    
  });
}
