const express = require("express");
const app = express();
const env = require("dotenv");

env.config();

app.use(express.urlencoded({ urlencoded : true }));
app.use(express.json());

app.get('/' , (req , res) => {
    res.send("Hello there !");
});

app.listen(process.env.PORT , () => {
    console.log("Server running ✅");
});