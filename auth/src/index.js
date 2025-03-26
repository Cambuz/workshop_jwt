require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express')
const app = express()
const port = 3000



// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// routes
require("./routes/auth.route")(app);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})