import express from "express";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

const db = new pg.Client({
    user:'postgres',
    host:'localhost',
    database:'Book APIS',
    password:'1225',
    port:5432
}); 
db.connect();

app.get("/", async (req, res) => {
    try{
        const result = await db.query("SELECT * FROM bookdetails ORDER BY rating DESC");
        // console.log(result.rows);
        const books = result.rows;
        console.log(books[0].date_completed);
        res.render("index.ejs",{data:books})
    }catch(error){
        res.render("index.ejs",{err:error})
    }
});

app.post("/sort", async (req,res) => {
    try{
        let sort = req.body.sort;
        let direction;
        if(sort === "title"){
            sort = 'book_name';
            direction= 'ASC'
        } else if(sort === "best"){
            sort = 'rating';
            direction='DESC'
        }else if(sort === "newest"){
            sort = 'date_completed';
            direction='DESC'
        } 
        const result = await db.query(`SELECT * FROM bookdetails ORDER BY ${sort} ${direction};`);
        const books = result.rows;
        res.json(books);
    }catch(error){
        res.json({err:error.message});
    }
});
app.listen(port ,() => {
    console.log("Server listening on port:",port);
});
