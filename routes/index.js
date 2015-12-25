
/*
 * GET home page.
 */

exports.index = function(req, res){
	//res.render('index', { title: 'Express' });
	res.render('page', { title: 'Ashish\'s www chat app :)' });
};

