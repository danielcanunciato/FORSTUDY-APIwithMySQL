const express = require('express');
const cors = require("cors");
const db = require("./db")

const API = express();
const PORT = 9050;

API.use(express.json());
API.use(cors());

API.get("/", (req,res)=>{
    res.status(200).json({message: "Hello World!"});
})

API.post("/login", async (req,res)=>{
    const { email, password } = req.body;

    // Check if fiedls are filled
    if (!email || !password) {
        return res.status(400).json({
            error: "Both email and password fields are necessary."
        });
    }

    // Search for user
    const [rows] = await db.query(
        "SELECT * FROM bd_users WHERE email = ?",
        [email]
    )

    // If no user found
    if (rows.length === 0) {
        return res.status(404).json({
            error: "User does not exist"
        })
    }

    const user = rows[0];

    // Compare password
    if (user.userpass !== password) {
        return res.status(401).json({
            error: "Invalid Password"
        });
    }

    // On success
    return res.status(200).json({id: user.id, username: user.username, email: user.email, created_at: user.created_at});
})

// [[[[[[[[ USERS ]]]]]]]] \\
API.get("/users", async(req,res)=>{
    try {
        const [rows]=await db.query("SELECT * FROM bd_users");

        res.status(200).json(rows);
    } catch(err) {
        error: err.message;
    }
})

API.post("/users", async(req,res)=>{
    try {
        const { username, password, email } = req.body;

        const [result] = await db.query(
            `INSERT INTO bd_users (username, userpass, email, created_at, updated_at)
            VALUES (?, ?, ?, CURDATE(), CURDATE())`,
            [username, password, email]
        );

        res.status(201).json({
            message: "User created successfully.",
            id: result.insertId
        });
    } catch(err) {
        res.status(500).json({error: err.message});
    }
})

API.patch("/users/:id", async(req,res)=>{
    try {
        // RECEIVE INFO
        const { id } = req.params;
        const { username, password, email } = req.body;

        // GET FIELD TO UPDATE AND ITS VALUES
        let fields = [];
        let vals = [];

        // CHECK IF EACH FIELD IS FILLED OR NOT
        if (username !== undefined) {
            fields.push("username = ?");
            vals.push(username);
        }

        if (password !== undefined) {
            fields.push("userpass = ?");
            vals.push(password);
        }

        if (email !== undefined) {
            fields.push("email = ?");
            vals.push(email);
        }

        // CHECK IF THERE IS NO FIELD SENT FOR REQUEST
        if (fields.length === 0) {
            return res.status(400).json({
                message: "No fields provided for update"
            });
        }

        // UPDATE updated_at COLUMN
        fields.push("updated_at = NOW()")
        vals.push(id);

        const query = `
            UPDATE bd_users
            SET ${fields.join(", ")}
            WHERE id = ?
        `;

        const [result] = await db.query(query, vals);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        res.status(200).json({
            message: "User updated successfully"
        })

    } catch(err) {
        return res.status(500).json({error: err.message});
    }
})

API.delete("/users/:id", async (req,res)=>{
    try {
        const userID = req.params.id;

        const [result] = await db.query(
            "DELETE FROM bd_users WHERE id = ?",
            [userID]
        )

        if (result.affectedRows === 0) {
            return res.status(404).json({error: "User does not exist."});
        }
        
        res.status(200).json({
            message: `Deleted User #${userID} from the database successfully.`
        });
    } catch(err) {
        return res.status(500).json({error: err.message});
    }
})

// LISTEN \\
API.listen(PORT, ()=>{
    console.log(`Running the API on http://localhost:${PORT}`)
})