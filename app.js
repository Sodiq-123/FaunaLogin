var express = require('express'),
    config = require('./configure'),
    path = require("path"),
    app = express();



app = config(app);
app.set("port", process.env.PORT || 4000);
app.set("views", path.join(__dirname, "views"));

var server = app.listen(app.get("port"), function () {
  console.log("Server up: http://localhost:" + app.get("port"));
});