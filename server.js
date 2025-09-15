import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000; 
const API_URL = "http://localhost:4000";
const FIXED_PASSWORD = "Soumya2802@";


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// show all
app.get("/", async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/accounts`);
        res.render("index.ejs", { accounts: response.data });
    } catch (error) {
        res.status(500).send("Error fetching accounts");
    }
});


// particular one show transtion

app.get("/account/:accountNumber", async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/accounts/${req.params.accountNumber}`);
        res.render("account.ejs", { account: response.data });
    } catch (error) {
        res.status(404).send("Account not found");
    }
});

// send mangae-account for add account
app.get("/new-account", (req, res) => {
    res.render("manage-account.ejs");
});

// work it for add new account
app.post("/create-account", async (req, res) => {
    try {
       const response=  await axios.post(`${API_URL}/accounts`, req.body);
        res.redirect("/");
        console.log(response.data);
    } catch (error) {
        res.status(500).send("Error creating account");
    }
});

//account.ejs to 
app.post("/transaction/:accountNumber", async (req, res) => {
    const accountNumber = req.params.accountNumber;
    try {
       const response= await axios.post(`${API_URL}/accounts/${accountNumber}/transactions`, req.body);
        res.redirect(`/account/${accountNumber}`);
        console.log(response.data);
    } catch (error) {
        res.status(500).send("Error processing transaction");
    }
});

//verification go to password.ejs
app.get("/enter-password/:accountNumber", (req, res) => {
    res.render("password.ejs", {
        accountNumber: req.params.accountNumber,
        error: null
    });
});

//verify
app.post("/verify-password/:accountNumber", (req, res) => {
    const password  = req.body.password;
    const accountNumber  = req.params.accountNumber;

    if (password === FIXED_PASSWORD) {
        res.redirect(`/account/${accountNumber}`);
    } else {
        res.render("password.ejs", {
            accountNumber: accountNumber,
            error: "Incorrect password. Please try again."
        });
    }
});

app.listen(port, () => {
    console.log(`🌐 Frontend server is running on http://localhost:${port}`);
});