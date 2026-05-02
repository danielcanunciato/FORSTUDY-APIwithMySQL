import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { parse } from "dotenv";

export default function UserDashboard() {
    const [loggedIn, setLogged] = useState(false);
    const [checklogin, setCheckLog] = useState(false);

    const [userMail, setUserMail] = useState("");
    const [userPass, setUserPass] = useState("");

    const [userInfo, setUserInfo] = useState({});
    const [getUserProds, setUserProds] = useState([]);

    const [hasProds, setHasProds] = useState(false);

    useEffect(()=>{
        const parsed_storage = JSON.parse(localStorage.getItem("userlogin"));

        if (parsed_storage && Object.keys(parsed_storage).length > 0) {
            setLogged(true);
            setUserInfo(parsed_storage);

            if (parsed_storage.id) {
                fetch(`http://localhost:9050/products/${parsed_storage.id}`)
                .then(res=>{
                    if (res.status === 404) {
                        return [];
                    }

                    if (!res.ok) {
                        throw new Error("Failed to fetch product.")
                    }
                    
                    setHasProds(true);
                    return res.json();
                })
                .then(data=>{
                    if (data){setUserProds(data)}
                })
                .catch(err=>console.error(err));
           }
        }

        setCheckLog(true);
    }, [])

    useEffect(()=>{

        if (checklogin) {
            localStorage.setItem("userlogin", JSON.stringify(userInfo))
        }

        }, [userInfo])

        async function handleLogin(e) {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:9050/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: userMail,
                password: userPass
            })
            });

            const data = await res.json();

            if (res.ok) {
                setLogged(true);
                setUserInfo(data);
                setHasProds(true);
                if (data.id) {
                    fetch(`http://localhost:9050/products/${data.id}`)
                    .then(res=>{
                        if (res.status === 404) {
                            setHasProds(false);
                            return [];
                        }

                        if (!res.ok) {
                            throw new Error("Failed to fetch product.")
                        }

                        return res.json();
                    })
                    .then(data=>{
                        if (data){setUserProds(data)}
                    })
                    .catch(err=>console.error(err));
                }
            } else {
                setLogged(false);
            }
        } catch(err) {
            console.error(err);
    }
    }

    function handleLogout(e) {
        e.preventDefault();

        setUserMail("");
        setUserPass("");
        setUserInfo({});
        setLogged(false);
    }

    function formatDate(dateValue) {
        const date = new Date(dateValue);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }


    return(
        <>
            <div>

                <h1>LOGGED IN: <b>{loggedIn ? "✅" : "❌"}</b></h1>

                { (!loggedIn) ? (
                    <form className="login-container" onSubmit={handleLogin}>
                        <h1>LOGIN</h1>

                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                placeholder="Enter your email"
                                value={userMail}
                                onChange={(e)=>{setUserMail(e.target.value)}}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                placeholder="Enter your password"
                                value={userPass}
                                onChange={(e)=>{setUserPass(e.target.value)}}
                                required
                            />
                        </div>

                        <button type="submit" className="login-btn">
                            Log In
                        </button>
                    </form>
                ) : (
                    <div>
                        <h3> Logged in as {userInfo.username} </h3>
                        <p> {userInfo.email}</p>
                        <p> <b>Joined At: </b>{formatDate(userInfo.created_at)}</p>

                        <button onClick={handleLogout} className="logout-btn">LOGOUT</button>
                        
                        {
                            (hasProds ? (
                                <table
                                    style={{
                                        width: "90%",
                                        margin: "20px auto",
                                        borderCollapse: "separate",
                                        borderSpacing: '4px',
                                        textAlign: "center"
                                    }}
                                >
                                    <thead>
                                        <tr
                                            style={{
                                                backgroundColor: "#111",
                                                color: "white"
                                            }}
                                        >
                                            <th style={{ padding: "12px" }}>ID</th>
                                            <th style={{ padding: "12px" }}>Product Name</th>
                                            <th style={{ padding: "12px" }}>Product Price</th>
                                            <th style={{ padding: "12px" }}>Product Quantity</th>
                                            <th style={{ padding: "12px" }}>Client Name</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {getUserProds.map((prod, index) => (
                                            <tr
                                                key={prod.id}
                                                style={{
                                                    backgroundColor:
                                                        index % 2 === 0
                                                            ? "#1a1a1a"
                                                            : "#2a2a2a"
                                                }}
                                            >
                                                <td style={{ padding: "12px" }}>
                                                    {prod.id}
                                                </td>

                                                <td style={{ padding: "12px" }}>
                                                    {prod.name}
                                                </td>

                                                <td style={{ padding: "12px" }}>
                                                    {Number(prod.price).toLocaleString("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL"
                                                    })}
                                                </td>

                                                <td style={{ padding: "12px" }}>
                                                    {prod.quantity}
                                                </td>

                                                <td style={{ padding: "12px" }}>
                                                    {prod.username}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{marginTop: `20px`}}>
                                    <p>No products found for <b>{userInfo.username}</b></p>
                                </div>
                            ))
                        }
                        
                    </div>
                )}

            </div>
        
        </>
    )
}