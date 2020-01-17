'use strict';

var model_word = require('server/app/models/word.model');
var model_suffix = require('server/app/models/suffix.model');
var env_config = require('server/config/development');
		
exports.get_searchWord = function(req, res)
{
	model_word.find({}, function(err, result) {
        if(err)
        {
            return res.status(200).json({
                result: 0,
                message: "no word"     
            });
        }
        if(!result)
        {
            return res.status(200).json({
                result: 0,
                message: "no word"     
            });
        }
        else
        {
            var return_data = [];

            for(var i = 0 ; i < result.length; i++)
            {
                for(var j = 0;  j < result[i].data.length; j++)
                {
                    var temp_count = {
                        user_id: req.body.user_id,
                        count: 0
                    }

                    var temp = {
                        index_no: result[i].data[j].index_no,
                        index_en: result[i].data[j].index_en,
                        index_jp: result[i].data[j].index_jp,
                        level: result[i].data[j].level,
                        english: result[i].data[j].english,
                        grammar: result[i].data[j].grammar,
                        gatakana: result[i].data[j].gatakana,
                        meaning: result[i].data[j].meaning,
                        voice_uk: result[i].data[j].voice_uk,
                        voice_us: result[i].data[j].voice_us,
                        search_count: 0,
                        view_count: 0,
                        show: true,
                        recite: false,
                        review_count: temp_count.count,
                        study_count: temp_count.count,
                        study_time: result[i].study_time,
                        test_mark: 0.0
                    }

                    

                    for(var k = 0; k < result[i].test_mark.length; k++)
                    {
                        if(result[i].test_mark[k].user_id = req.body.user_id)
                        {
                            temp.test_mark = result[i].test_mark[k].mark;
                        }
                    }

                    for(var k = 0; k < result[i].data[j].study_count.length; k++)
                    {
                        if(result[i].data[j].study_count[k].user_id = req.body.user_id)
                        {
                            temp.study_count = result[i].data[j].study_count[k].count;
                        }
                    }

                    if(result[i].data[j].search_count.length == 0)
                        temp.search_count = 0;
                    else
                    {
                        for(var k = 0;  k < result[i].data[j].search_count.length; k++)
                        {
                            if(result[i].data[j].search_count[k].user_id == req.body.user_id)
                            {
                                temp.search_count = result[i].data[j].search_count[k].count;
                                break;
                            }
                        }
                    }

                    if(result[i].data[j].view_count.length == 0)
                        temp.view_count = 0;
                    else
                    {
                        for(var k = 0;  k < result[i].data[j].view_count.length; k++)
                        {
                            if(result[i].data[j].view_count[k].user_id == req.body.user_id)
                            {
                                temp.view_count = result[i].data[j].view_count[k].count;
                                break;
                            }
                        }
                    }


                  
                    if(result[i].data[j].recite.length == 0)
                        temp.recite = false;
                    else
                    {
                        for(var k = 0;  k < result[i].data[j].recite.length; k++)
                        {
                            if(result[i].data[j].recite[k].user_id == req.body.user_id)
                            {
                                temp.recite = true;
                                break;
                            }
                        }
                    }

                    if(result[i].data[j].show.length == 0)
                        temp.show = true;
                    else
                    {
                        for(var k = 0;  k < result[i].data[j].show.length; k++)
                        {
                            if(result[i].data[j].show[k].user_id == req.body.user_id)
                            {
                                temp.show = false;
                                break;
                            }
                        }
                    }

                    return_data.push(temp);
                }
            }

            var suffixes = [];

            model_suffix.find({}, function(err, result) {
                if(err)
                {
                    return res.status(200).json({
                        result: 0,
                        message: "no word"     
                    });
                }
                for(var i = 0; i < result.length; i++)
                {
                    suffixes.push(result[i].suffix);
                }
                return res.status(200).json({
                    result: 1,
                    word: return_data,
                    suffix: suffixes
                });

            });
            
        }
    });
}

exports.change_word_status = function(req, res)
{
    model_word.findOne({level: req.body.level}, function(err, result) 
        {
            if(err)
            {
                return res.status(200).json({
                    result: 0,
                    message: "no word"     
                });
            }
            if(!result)
            {
                return res.status(200).json({
                    result: 0,
                    message: "no word"     
                });
            }
            else
            {
                result.study_time = new Date().toISOString(); 

                for(var i = 0; i < result.data.length; i++)
                {
                    if(result.data[i].english ==  req.body.english)
                    {
                        //search_count
                        var flag = false;
                        for(var j =0 ; j < result.data[i].search_count.length; j++)
                        {
                            if(result.data[i].search_count[j].user_id == req.body.user_id)
                            {
                                result.data[i].search_count[j].count = req.body.search_count;
                                flag = true;
                            }
                        }
                        

                        if(flag == false)
                        {
                            var temp = {
                                user_id: req.body.user_id,
                                count: req.body.search_count
                            }
                            result.data[i].search_count.push(temp);
                        }

                        //test_mark
                        var flag = false;
                        for(var j =0 ; j < result.test_mark.length; j++)
                        {
                            if(result.test_mark[j].user_id == req.body.user_id)
                            {
                                result.test_mark[j].mark = req.body.test_mark;
                                flag = true;
                            }
                        }
                        

                        if(flag == false)
                        {
                            var temp = {
                                user_id: req.body.user_id,
                                mark: req.body.test_mark
                            }
                            result.test_mark.push(temp);
                        }

                        //view_count

                        flag = false;
                        for(var j =0 ; j < result.data[i].view_count.length; j++)
                        {
                            if(result.data[i].view_count[j].user_id == req.body.user_id)
                            {
                                result.data[i].view_count[j].count = req.body.view_count;
                                flag = true;
                            }
                        }

                        if(flag == false)
                        {
                            var temp = {
                                user_id: req.body.user_id,
                                count: req.body.view_count
                            }
                            result.data[i].view_count.push(temp);
                        }

                        //study_count
                        flag = false;
                        for(var j =0 ; j < result.data[i].study_count.length; j++)
                        {
                            if(result.data[i].study_count[j].user_id == req.body.user_id)
                            {
                                result.data[i].study_count[j].count = req.body.study_count;
                                flag = true;
                            }
                        }
                        
                        if(flag == false)
                        {
                            var temp = {
                                user_id: req.body.user_id,
                                count: req.body.study_count
                            }
                            result.data[i].study_count.push(temp);
                        }

                        //show
                        flag = false;
                        for(var j =0 ; j < result.data[i].show.length; j++)
                        {
                            if(result.data[i].show[j].user_id == req.body.user_id && req.body.show == "True")
                            {
                                result.data[i].show.splice(j, 1);
                                flag = true;
                            }
                        }

                        if(flag == false)
                        {
                            if(req.body.show == "False")
                            {
                                var temp = {
                                    user_id: req.body.user_id,
                                }
                                result.data[i].show.push(temp);
                            }
                        
                        }


                        //recite
                        flag = false;
                        for(var j =0 ; j < result.data[i].recite.length; j++)
                        {
                            if(result.data[i].recite[j].user_id == req.body.user_id && req.body.recite == "False")
                            {
                                result.data[i].recite.splice(j, 1);
                                flag = true;
                            }
                        }

                        if(flag == false)
                        {
                            if(req.body.recite == "True")
                            {
                                var temp = {
                                    user_id: req.body.user_id,
                                }
                                result.data[i].recite.push(temp);
                            }
                            
                        }

                        //review_count
                        flag = false;
                        for(var j =0 ; j < result.data[i].review_count.length; j++)
                        {
                            if(result.data[i].review_count[j].user_id == req.body.user_id)
                            {
                                result.data[i].review_count[j].count = req.body.review_count;
                                flag = true;
                            }
                        }
                        
                        if(flag == false)
                        {
                            var temp = {
                                user_id: req.body.user_id,
                                count: req.body.review_count
                            }
                            result.data[i].review_count.push(temp);
                        }
                    }
                }

                model_word.findOneAndUpdate({level: req.body.level }, {$set: result}, {new: true},  function(err, user){
                    if (err) {
                        return res.status(500).send({ message: err.message });
                    }
                });
            }

            return res.status(200).json({
                result: 1,
                message: "no word"     
            });
        }
    );
}


exports.release_hideword = function(req, res)
{
    model_word.findOne({level: req.body.level}, function(err, result) 
        {
            if(err)
            {
                return res.status(200).json({
                    result: 0,
                    message: "no word"     
                });
            }
            if(!result)
            {
                return res.status(200).json({
                    result: 0,
                    message: "no word"     
                });
            }
            else
            {
                for(var i = 0; i < result.data.length; i++)
                {
                    //show
                    for(var j =0 ; j < result.data[i].show.length; j++)
                    {
                        if(result.data[i].show[j].user_id == req.body.user_id)
                        {
                            result.data[i].show.splice(j, 1);
                        }
                    }

                 
                }

                model_word.findOneAndUpdate({level: req.body.level }, {$set: result}, {new: true},  function(err, user){
                    if (err) {
                        return res.status(500).send({ message: err.message });
                    }
                });
            }

            return res.status(200).json({
                result: 1,
                message: "no word"     
            });
        }
    );
}