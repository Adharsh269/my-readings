import express from "express";
import pg from "pg";
import axios from "axios";
import env from "dotenv";

const app = express();
const port = 4000;
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

app.get("/", (req, res) => {
    res.render("new.ejs");
});

app.post("/newbook", async (req, res) => {
    try{
        const bookDetails = {
            title : req.body.title,
            author : req.body.author,
            rating : req.body.rating,
            description : req.body.description,
            completionDate : req.body.completionDate
        };
        const result = await axios.get(`https://openlibrary.org/search.json?q=${bookDetails.title}`);
        const firstDoc = result.data.docs[1]
        if(!firstDoc || bookDetails.title !== firstDoc.title) {
            return res.json({success : false, message : "Book not found"});
        }
        const details = {
            title : firstDoc.title,
            published_year : firstDoc.publish_year[0],
            noOfPages : firstDoc.number_of_pages_median,
            subject : firstDoc.subject?
                        firstDoc.subject
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .slice(0,6) : [],
            review : `www.google.com/search?q=${firstDoc.title}+${firstDoc.author_name}`,
            image : `https://covers.openlibrary.org/b/olid/${firstDoc.cover_edition_key}-M.jpg`
        }
        await db.query("INSERT INTO bookdetails (book_name, author_name, rating, description, date_completed, book_reviews, publication_date, no_of_pages, subject, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
            [details.title, bookDetails.author,bookDetails.rating, bookDetails.description, bookDetails.completionDate, 
                details.review, details.published_year, details.noOfPages,
                details.subject.join(', '),
                details.image
            ]   
        );
        res.redirect("/");
    }catch(error) {
        console.log(error);
        res.redirect("/");
    }
});
app.listen(port ,() => {
    console.log("Server listening on port:",port);
});