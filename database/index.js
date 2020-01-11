const mongoose= require('mongoose');

mongoose.connect('mongodb://localhost/cartasMultiplayer',{useNewUrlParser: true});
mongoose.Promise= global.Promise;

module.exports=mongoose;