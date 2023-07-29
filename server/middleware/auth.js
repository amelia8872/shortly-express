const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  // req.body.username
  // req.cookies
  // req.headers.cookie

  if (req.cookies === undefined || Object.keys(req.cookies).length === 0) {
    // console.log('NO COOKIE IN JAR');
    models.Sessions.create()
      .then((success) => {
        // ResultSetHeader {-,
        //   fieldCount: 0,_-_-__|  /\_/\
        //   affectedRows: 1,_-_~|_( ^ .^)
        //   insertId: 1,_-_-_-_ ""  ""
        //   info: '',
        //   serverStatus: 2,
        //   warningStatus: 0
        // }
        // session (id, hash, userId).
        var options = {};
        options['id'] = success.insertId;

        // Note: Without the return , the second .then() block would not be able to access the result of the models.Sessions.get(options) operation,
        return models.Sessions.get(options);
      })
      .then(success => {
        //console.log("WE ARE HERE!", success);


        //             TextRow {""  ""
        //   id: 1,
        //   hash: '0c794224b6d08028514ed526e62df95ddb531674c86d051ea9ed54c433222504',
        //   userId: null
        // }
        // coockieParser req.headers.cookie -> req.cookies
        // auth req.cookies -> req.session -> res.cookies
        req.session = {'hash': success.hash};
        res.cookie('shortlyid', success.hash);
        //res.cookies = {'shortlyid': {value: success.hash}};
        // console.log('cookies attached to res: ', res);
        // cookies['shortlyid'].value
        //console.log('res.cookies', res.cookies);
        next();
      })
      .catch(error => {
        console.log(error);
      });
    /*
        if ((req.cookies === undefined) || Object.keys(req.cookies).length === 0) {
    //console.log('no cookies in the jar...');
    // create session
    models.Sessions.create().
      then((success) => {
        // retreive new session we made
        return models.Sessions.get({ id: success.insertId });
      })
      // use the object returned from get
      .then((success) => {
        //console.log(success);
        // save hash value in variable
        var hash = success.hash;
        // set session on req
        req.session = {hash};
        // set cookie for the response with use .cookie function
        res.cookie('shortlyid', hash);
        // call next
        next();
      })
      .catch((err) => {
        console.error('error creating a new session:' + err);
      });
       */
  } else {
    //console.log('cookies in the jar');
    // If the req.cookies object is not empty, it means that the client already has a session cookie named "shortlyid."
    // look for session in sessions database (shortlyid for comparison)
    // again set hash variable
    var hash = req.cookies.shortlyid;
    // search using hash
    models.Sessions.get({hash})
    //check if there is an existing session with the given hash.
      .then((data) => {
        if (data !== undefined) {
          // console.log(data);
          // a session was found set req and res as done above
          req.session = data;
          res.cookie('shortlyid', req.session.hash);
        } else {
          // console.log('NO SESSION');
          // no session found so lets create on
          models.Sessions.create()
            .then((data) => {
              // console.log('DATA! ', data);
              // the create fuction returns the newly created session obj
              // use the insertId to search our database and return the TextRow obj
              var id = data.insertId;
              return models.Sessions.get({id});
            })
            .then((sessionData)=> {
              // console.log('SESSION DATA: ', sessionData);
              // use this newly created session obj to set req and res as done above
              req.session = sessionData;
              res.cookie('shortlyid', req.session.hash);
              next();
            });
        }
        next();
      });
  }
};



    // console.log('this is the hash of the session we want: ', req.cookies.shortlyid);
    // var hash = req.cookies.shortlyid;
    // // console.log("WE ARE HERE!", hash);

    // models.Sessions.get({hash})
    //   .then((success) => {
    //     // console.log('I AM HERE!!!!!!', success);
    //     if (!success || !success.userId) {
    //     // Handle the case when the session does not exist or does not have a userId.
    //     // For example, you can create a new session here if needed.
    //       req.session = { 'hash': hash };
    //       res.cookies = { 'shortlyid': { value: hash } };
    //       next();
    //     } else {
    //       models.Users.get({ id: success.userId })
    //         .then((user) => {
    //           req.session = {
    //             'hash': success.hash,
    //             'user': { 'username': user.username },
    //             'userId': user.id
    //           };
    //           res.cookies = { 'shortlyid': { value: success.hash } };
    //           next();
    //         })
    //         .catch((error) => {
    //           console.log(error);
    //           next();
    //         });
//         }

//       })
//       .catch((error) => {
//         console.log(error);
//         next();
//       });
//   }
// };





/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

module.exports.verifySession = (req, res, next) => {
  console.log('Auth.verifySession,', req.session);
  if (!models.Sessions.isLoggedIn(req.session)) {
    console.log('going to login page');
    res.redirect('/login');
  } else {
    next();

  }
};



