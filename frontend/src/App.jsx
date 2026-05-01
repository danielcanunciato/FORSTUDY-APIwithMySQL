import { useState, useEffect, useDeferredValue, useTransition } from "react";
import "./App.css";
import { parse } from "dotenv";

export default function App() {

  const [loggedIn, setLogged] = useState(false);
  const [checklogin, setCheckLog] = useState(false);

  const [userMail, setUserMail] = useState("");
  const [userPass, setUserPass] = useState("");

  const [userInfo, setUserInfo] = useState({});

  useEffect(()=>{
      const parsed_storage = JSON.parse(localStorage.getItem("userlogin"));

      if (parsed_storage && Object.keys(parsed_storage).length > 0) {
        setLogged(true);
        setUserInfo(parsed_storage);
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

  return (
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

            <div className="extra-links">
                <a href="#">Forgot Password?</a>
            </div>
        </form>
        ) : (
          <div>
            <h3> Logged in as {userInfo.username} </h3>
            <p> {userInfo.email}</p>
            <p> <b>Joined At: </b>{formatDate(userInfo.created_at)}</p>

            <button onClick={handleLogout} className="logout-btn">LOGOUT</button>

          </div>
        )}

      </div>

    </>
  )
}