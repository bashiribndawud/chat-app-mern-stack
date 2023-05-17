import axios from "axios";
import { createContext, useContext, useReducer, useEffect } from "react";

const userContext = createContext();
const initialState = {
  username: null,
  id: null,
};

const reducerFn = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        username: action.username,
        id: action.id,
      };
    case "LOG_OUT":
      return {
        ...state,
        user: null,
        id: null,
      };
  }
};

// HOC
export const UserContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducerFn, initialState);
  const token = localStorage.getItem("token");
  useEffect(() => {
    function getUser() {
      if (!state.user) {
        axios
          .get("/auth/profile", { params: { token } })
          .then((response) => {
            dispatch({
              type: "SET_USER",
              username: response.data.username,
              id: response.data.id,
            });
          })
          .catch((error) => console.log(error));
      }
    }
    getUser();
  }, []);
  return (
    <userContext.Provider value={{ state, dispatch }}>
      {children}
    </userContext.Provider>
  );
};

export const useUserContext = () => useContext(userContext);
