import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000; 
const API_URL = "https://digital-bank-1-d91i.onrender.com";
const FIXED_PASSWORD = "12345678";


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

// Password verification for new account creation
app.get("/new-account", (req, res) => {
    res.render("password.ejs", {
        action: "create-account",
        title: "Create New Account",
        message: "Enter password to create a new account",
        error: null
    });
});

// Verify password for account creation
app.post("/verify-create-account", (req, res) => {
    const password = req.body.password;
    
    if (password === FIXED_PASSWORD) {
        res.render("manage-account.ejs");
    } else {
        res.render("password.ejs", {
            action: "create-account",
            title: "Create New Account",
            message: "Enter password to create a new account",
            error: "Incorrect password. Please try again."
        });
    }
});

// work it for add new account
app.post("/create-account", async (req, res) => {
    try {
       const response = await axios.post(`${API_URL}/accounts`, req.body);
        res.redirect("/");
        console.log(response.data);
    } catch (error) {
        res.status(500).send("Error creating account");
    }
});

// Password verification for account deletion
app.get("/delete-account/:accountNumber", async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/accounts/${req.params.accountNumber}`);
        res.render("password.ejs", {
            action: "delete",
            accountNumber: req.params.accountNumber,
            accountData: response.data,
            title: "Delete Account",
            message: `Enter password to delete account: ${response.data.accountHolderName} (${req.params.accountNumber})`,
            error: null
        });
    } catch (error) {
        res.status(404).send("Account not found");
    }
});

// Verify password and delete account
app.post("/verify-delete/:accountNumber", async (req, res) => {
    const password = req.body.password;
    const accountNumber = req.params.accountNumber;

    if (password === FIXED_PASSWORD) {
        try {
            await axios.delete(`${API_URL}/accounts/${accountNumber}`);
            res.redirect("/?deleted=true");
        } catch (error) {
            res.status(500).send("Error deleting account");
        }
    } else {
        try {
            const response = await axios.get(`${API_URL}/accounts/${accountNumber}`);
            res.render("password.ejs", {
                action: "delete",
                accountNumber: accountNumber,
                accountData: response.data,
                title: "Delete Account",
                message: `Enter password to delete account: ${response.data.accountHolderName} (${accountNumber})`,
                error: "Incorrect password. Please try again."
            });
        } catch (error) {
            res.status(404).send("Account not found");
        }
    }
});

//account.ejs to 
app.post("/transaction/:accountNumber", async (req, res) => {
    const accountNumber = req.params.accountNumber;
    try {
       const response = await axios.post(`${API_URL}/accounts/${accountNumber}/transactions`, req.body);
        res.redirect(`/account/${accountNumber}`);
        console.log(response.data);
    } catch (error) {
        res.status(500).send("Error processing transaction");
    }
});

//verification go to password.ejs
app.get("/enter-password/:accountNumber", (req, res) => {
    res.render("password.ejs", {
        action: "view-account",
        accountNumber: req.params.accountNumber,
        title: "Account Access",
        message: "Enter password to access account",
        error: null
    });
});

//verify
app.post("/verify-password/:accountNumber", (req, res) => {
    const password = req.body.password;
    const accountNumber = req.params.accountNumber;

    if (password === FIXED_PASSWORD) {
        res.redirect(`/account/${accountNumber}`);
    } else {
        res.render("password.ejs", {
            action: "view-account",
            accountNumber: accountNumber,
            title: "Account Access",
            message: "Enter password to access account",
            error: "Incorrect password. Please try again."
        });
    }
});

app.listen(port, () => {
    console.log(`🌐 Frontend server is running on http://localhost:${port}`);
});