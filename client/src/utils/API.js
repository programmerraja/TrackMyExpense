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

  getExpense: function (type, params, workspaceId) {
    const query = new URLSearchParams(params);
    query.set("type", type);
    if (workspaceId) query.set("workspaceId", workspaceId);
    return axios.get(`/api/v1/expense/?${query.toString()}`);
  },
  addExpense: function (body) {
    return axios.post(`/api/v1/expense/`, body);
  },
  deleteExpense: function (id) {
    return axios.delete(`/api/v1/expense/${id}`);
  },
  processRecurring: function () {
    return axios.post(`/api/v1/expense/recurring`);
  },
  searchExpense: function (query, workspaceId) {
    const params = new URLSearchParams({ q: query });
    if (workspaceId) params.set("workspaceId", workspaceId);
    return axios.get(`/api/v1/expense/search?${params.toString()}`);
  },
  getPeople: function () {
    return axios.get(`/api/v1/expense/people`);
  },
  getBankMappings: function () {
    return axios.get("/api/v1/expense/bank-mappings");
  },
  saveBankMapping: function (mapping) {
    return axios.put("/api/v1/expense/bank-mappings", mapping);
  },
  deleteBankMapping: function (id) {
    return axios.delete(`/api/v1/expense/bank-mappings/${id}`);
  },
  getWorkspaces: function () {
    return axios.get("/api/v1/workspaces");
  },
  createWorkspace: function (name) {
    return axios.post("/api/v1/workspaces", { name });
  },
  getPriceTracking: function (type = "gold") {
    return axios
      .get(`/api/v1/price/track?type=${type}`)
      .then((res) => res.data);
  },
  // User stocks management
  getUserStocks: function () {
    return axios.get("/api/v1/price/stocks");
  },
  addUserStock: function (stockData) {
    return axios.post("/api/v1/price/stocks", stockData);
  },
  removeUserStock: function (symbol) {
    return axios.delete(`/api/v1/price/stocks/${symbol}`);
  },
  // Portfolio management
  getHoldings: function () {
    return axios.get("/api/v1/price/portfolio/holdings");
  },
  getTransactions: function () {
    return axios.get("/api/v1/price/portfolio/transactions");
  },
  addTransaction: function (txData) {
    return axios.post("/api/v1/price/portfolio/transactions", txData);
  },
  updateSettings: function (settings) {
    // this.setAuthHeader(); // Ensure header is set
    return axios.put("/api/v1/signin/settings", { budgetSettings: settings });
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
