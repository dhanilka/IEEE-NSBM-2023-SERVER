const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql');
require('dotenv').config(); // Load environment variables


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'ieee_games',
};

const mscon = mysql.createConnection(dbConfig);

mscon.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1); // Exit the app on database connection error
    } else {
        console.log('Connected to the database');
        app.listen(5565, () => {
            console.log(`App listening on port 5565`);
        }); 
    }
});

app.post('/add-group', async(req,res)=>{
    const grpNo = await req.body.groupNo;
    const grpName = await req.body.groupName;
    const grpScore = 0;
    
    let sqlQuery = 'INSERT INTO leaderboard(grp_no,grp_name,grp_score) VALUES(?,?,?)'
    mscon.query(sqlQuery,[grpNo,grpName,grpScore],(err,resluts)=>{
        if(err){
            res.status(500).json({message:'Group Adding Failed !'})
        }else{
            res.status(200).json({message:'Group Adding Success !'})
        }
    })
})


app.get('/fetch-data', async (req,res)=>{
    let sql = "SELECT * FROM leaderboard ORDER BY grp_score DESC";
    mscon.query(sql,async(err,rows)=>{
        const results = await rows;
        console.log(results)

        if(err){
            res.status(500).send({message:'Internal server error'})
        }else{
            res.status(200).json({ message: 'Success', data: results });
        }
    })
})

app.get('/leaderboard-data', async (req, res) => {
    let sql = 'SELECT * FROM leaderboard ORDER BY grp_score DESC LIMIT 5';
    mscon.query(sql, async (err, rows) => {
        if (err) {
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json({ message: 'Success', data: rows });
        }
    });
});

app.post('/update-data', (req, res) => {
    const { groupName, score, groupNo } = req.body;
  
    const sql = 'UPDATE leaderboard SET grp_name = ?, grp_score = ? WHERE grp_no = ?';
    mscon.query(sql, [groupName, score, groupNo], (err, result) => {
      if (err) {
        console.error('Error updating data:', err);
        res.status(500).json({ message: 'Data Update Failed' });
      } else {
        console.log('Data updated successfully');
        res.status(200).json({ message: 'Data Update Success' });
      }
    });
  });
  


app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});
