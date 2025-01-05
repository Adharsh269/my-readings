import express from "express";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

const db = new pg.Client({
    user:process.env.PG_USER,
    host:process.env.PG_HOST,
    database:process.env.PG_DATABASE,
    password:process.env.PG_PASSWORD,
    port:process.env.PG_PORT
}); 
db.connect();

app.get("/", async (req, res) => {
    try{
        const result = await db.query("SELECT * FROM bookdetails ORDER BY rating DESC");
        // console.log(result.rows);
        const books = result.rows;
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
