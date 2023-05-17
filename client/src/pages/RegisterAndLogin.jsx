import { useState } from "react";
import axios from "axios";
import { useUserContext } from "../context/userContext";
import toast, { Toaster } from "react-hot-toast";
import Loader from "../components/Loader";
const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("register");
  const [loading, setLoading] = useState(false);
  const {
    state: { username: name },
    dispatch,
  } = useUserContext();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url = isLoginOrRegister === 'register' ? 'register' : 'login'
    console.log(url);
    try {
      const response = await axios.post(`/auth/${url}`, {
        username,
        password,
      });
      if (response.status === 201 || 200) {
        dispatch({
          type: "SET_USER",
          username: response.data.username,
          id: response.data.id,
        });
        localStorage.setItem("token", response.data.token);
        setLoading(false);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          toast.error(error.response.data.message);
          setLoading(false);
        }
        if (error.response.status === 400) {
          toast.error(error.response.data.message);
          setLoading(false);
        }
      }
    }
  };
  return (
    <div className="bg-blue-50 h-screen w-screen flex items-center justify-center">
      {" "}
      <Toaster position="top-right" reverseOrder={false} />
      <form action="" className="w-[25rem] mx-5" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="username"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="block focus:outline-none w-full p-4 mb-2 rounded-xl"
        />
        <input
          type="password"
          name="password"
          placeholder="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block focus:outline-none p-4 rounded-xl w-full"
        />
        <button className="w-full bg-blue-600 text-white p-4 my-2 rounded-xl flex items-center justify-center">
          {loading ? (
            <Loader />
          ) : isLoginOrRegister === "register" ? (
            "Register"
          ) : (
            "Login"
          )}
        </button>
        {isLoginOrRegister === "register" && (
          <div className="text-center text-xl">
            <span className="text-blue-500">Already have an account?</span>
            <button onClick={() => setIsLoginOrRegister("login")}>Login</button>
          </div>
        )}
        {isLoginOrRegister === "login" && (
          <div className="text-center text-xl">
            <span className="text-blue-500">Don't have an account?</span>
            <button onClick={() => setIsLoginOrRegister("register")}>
              Register
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Register;
