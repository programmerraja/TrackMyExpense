import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SquareLoader from "../../components/SquareLoader";
import { useToast } from "../../components/Toast";

import API from "../../utils/API";

import "./style.css";

function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState("");

  const history = useNavigate();
  const { addToast } = useToast();

  function validate() {
    if (email && password) {
      return true;
    }
    return false;
  }

  function HandleForm() {
    if (validate()) {
      setLoading(true);
      API.signIn({ email, password })
        .then((res) => {
          setLoading(false);
          if (res.data.status === "success") {
            API.setToken(res.data.token);
            API.setAuthHeader();
            history("/");
          }
        })
        .catch((res) => {
          res = res.response;
          setLoading(false);
          addToast(
            res?.data?.msg || "Something went wrong. Please try again.",
            "error",
          );
        });
    } else {
      addToast("Please fill in all fields", "error");
    }
  }

  return (
    <>
      <SquareLoader loading={loading} msg={"Please wait, we'll let you in"} />
      <div className="user">
        <p>Welcome Back</p>
      </div>
      <div className="signin_container">
        <div className="form_container">
          <div className="form_input">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              placeholder="Email..."
              name="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>

          <div className="form_input">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              placeholder="Password..."
              name="password"
              required
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>

          <div className="form_button">
            <input
              type="submit"
              name="signin"
              value="Sign In"
              className="signin_button"
              onClick={HandleForm}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Signin;
