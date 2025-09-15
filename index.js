import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 4000; 


let accounts = [
    {
        accountNumber: 2024001,
        accountHolderName: "Susmita Masat",
        accountType: "Savings",
        balance: 5200.50,
        createdAt: new Date(),
        transactions: [
            { id: 1, type: "deposit", amount: 1000, timestamp: new Date() },
            { id: 2, type: "withdraw", amount: 200, timestamp: new Date() },
        ],
    },
    {
        accountNumber: 2024002,
        accountHolderName: "Tarpan Mandal",
        accountType: "Current",
        balance: 1500.00,
        createdAt: new Date(),
        transactions: [
            { id: 1, type: "deposit", amount: 1500, timestamp: new Date() }
        ],
    },
];

let lastAccountNumber = 2024002;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// all account show
app.get("/accounts", (req, res) => {
    res.json(accounts);
});

// particular account
app.get("/accounts/:accountNumber", (req, res) => {
    const accountNumber = parseInt(req.params.accountNumber);
    const account = accounts.find((acc) => acc.accountNumber === accountNumber);
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.json(account);
});

// new account
app.post("/accounts", (req, res) => {
    const newAccountNumber = ++lastAccountNumber;
    const newAccount = {
        accountNumber: newAccountNumber,
        accountHolderName: req.body.accountHolderName,
        accountType: req.body.accountType,
        balance: parseFloat(req.body.initialDeposit) || 0,
        createdAt: new Date(),
        transactions: [],
    };
    if (newAccount.balance > 0) {
        newAccount.transactions.push({
            id: 1,
            type: "deposit",
            amount: newAccount.balance,
            timestamp: new Date()
        });
    }
    accounts.push(newAccount);
    res.status(201).json(newAccount);
});

//deposite or credit

app.post("/accounts/:accountNumber/transactions", (req, res) => {
    const accountNumber = parseInt(req.params.accountNumber);
    const account = accounts.find((acc) => acc.accountNumber === accountNumber);

    if (!account) return res.status(404).json({ message: "Account not found" });

    const amount = parseFloat(req.body.amount);
    const type = req.body.type; 

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid transaction amount." });
    }

    if (type === "withdraw" && account.balance < amount) {
        return res.status(400).json({ message: "Insufficient funds." });
    }
    
    
    account.balance = type === 'deposit' ? account.balance + amount : account.balance - amount;


    const newTransaction = {
        id: account.transactions.length + 1,
        type: type,
        amount: amount,
        timestamp: new Date()
    };
    account.transactions.push(newTransaction);
    
    res.status(201).json(account);
});

//lisen

app.listen(port, () => {
    console.log(`💰 Bank API is running at http://localhost:${port}`);
});