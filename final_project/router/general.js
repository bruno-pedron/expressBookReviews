const express = require('express');
let books = require("./booksdb.js");
const axios = require('axios');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    if (users.find((user) => user.username === username)) {
      return res.status(409).json({ message: "Username already exists" });
    }
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

//Get the book list available in the shop
 public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));
});

// public_users.get('/', async function (req, res) {
//   try {
//     const response = await axios.get('http://localhost:5000/books');
//     const books = response.data;
//     return res.status(200).json(books);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({message: "Error getting book list"});
//   }
//});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
   const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.json(books[isbn]);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
 });

 //Get book details by ISBN using Promises
 public_users.get("/server/asynbooks/isbn/:isbn", function (req,res) {
  let {isbn} = req.params;
  axios.get(`http://localhost:5000/isbn/${isbn}`)
  .then(function(response){
    console.log(response.data);
    return res.status(200).json(response.data);
  })
  .catch(function(error){
      console.log(error);
      return res.status(500).json({message: "Error while fetching book details."})
  })
});
  
// Get book details based on author
  public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const authorBooks = [];
  for (const book in books) {  
    if (books[book].author == author) {  
      authorBooks.push(books[book]);
    }
  }
  if (authorBooks.length > 0) {  
    res.send(authorBooks);  
  } else {
    res.status(404).send('There are no books written by this author');  
  }
});

//Get book details by author using promises
public_users.get("/server/asynbooks/author/:author", function (req,res) {
  let {author} = req.params;
  axios.get(`http://localhost:5000/author/${author}`)
  .then(function(response){
    console.log(response.data);
    return res.status(200).json(response.data);
  })
  .catch(function(error){
      console.log(error);
      return res.status(500).json({message: "Error while fetching book details."})
  })
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.toLowerCase();
    const PastFilterBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title));
    if(PastFilterBooks.length > 0){
        return res.status(200).json(PastFilterBooks);
    }
    else{
        return res.status(404).json({message: "Book not available"});
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    const reviews = books[isbn].reviews;
    return res.status(200).json(reviews);
});

module.exports.general = public_users;
