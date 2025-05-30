import axios from "axios";
import jwt_decode from "jwt-decode";

export default {
  setToken: function (token) {
    localStorage.setItem("token", token);
  },
  isAuth: function () {
    let token = localStorage.getItem("token");
    if (token) {
      return true;
    }
    return false;
  },
  setAuthHeader: function () {
    let token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    }
  },
  removeAuthHeader: function () {
    axios.defaults.headers.common["Authorization"] = "";
  },
  checkTokenExp: function () {
    return true;
    let token = localStorage.getItem("token");
    //check only if token avalible and checking it is valid token
    //if it valid token if we split according to dot the array length will greater then or =2
    if (token && token.split(".").length >= 2) {
      var decoded = jwt_decode(token);
      let currentDate = new Date();
      // JWT exp is in seconds
      if (decoded.exp * 1000 < currentDate.getTime()) {
        //removing user data from local storage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        return true;
      }
    } else {
      //token not valid mean it expired so true
      return true;
    }
    return false;
  },
  decodedUserJWT: function () {
    let token = localStorage.getItem("token");
    //check only if token avalible
    if (token && token.split(".").length >= 2) {
      var decoded = jwt_decode(token);
      let user = decoded;
      return user;
    }
    return null;
  },

  signIn: function (userCred) {
    return axios.post("/api/v1/signin/", userCred);
  },

  getExpense: function (type, params) {
    return axios.get(`/api/v1/expense/?type=${type}&${params}`);
  },
  addExpense: function (body) {
    return axios.post(`/api/v1/expense/`, body);
  },
  deleteExpense: function (id) {
    return axios.delete(`/api/v1/expense/${id}`);
  },
  getPriceTracking: function (type = "gold") {
    return axios
      .get(`/api/v1/price/track?type=${type}`)
      .then((res) => res.data);
  },
  // User stocks management
  getUserStocks: function () {
    return axios.get('/api/v1/price/stocks');
  },
  addUserStock: function (stockData) {
    return axios.post('/api/v1/price/stocks', stockData);
  },
  removeUserStock: function (symbol) {
    return axios.delete(`/api/v1/price/stocks/${symbol}`);
  },
  numberWithCommas: function (x) {
    if (x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return x;
  },
};

function setAuthHeader() {
  let token = localStorage.getItem("token");
  if (token) {
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
  }
}
//setting token
setAuthHeader();
