var express = require('express');
var router = express.Router();

var express = require('express');

const TIParser = require("./../parsers/ti-parser.js");

router.get('/', function(req, res, next) {
    res.render('index', { parsed: false });
});

router.post('/', function(req, res) {
    const parsers = {
        'target-inventory-service': new TIParser()
    }

    const render = (report, error) => {
	    res.render('index', {
	        url: req.body.url,
	        parsed: true,
	        report: report,
	        error: error
	    });
    }

    var found = false;
    Object.keys(parsers).forEach((key) => {
        if (req.body.url.indexOf(key) > -1) {
        	response = parsers[key].parse(req.body.url, render);
        	found = true;
        }
    });

    if (!found) {
    	render(null, "Invalid URL provided.");
    }
})

module.exports = router;