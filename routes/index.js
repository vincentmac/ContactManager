
// require('./main');
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Backbone.js Web App' })
};