import { signInWithEmailAndPassword } from "firebase/auth";
import { authenticator } from "../../utils/firebase.config";
import { useContext, useRef, useState } from "react";
import { useToast } from "../../contexts/toast-context";
// import withAuthLayout from "../../components/layouts/withAuthLayout";
import { useNavigate } from "react-router";
import { AuthContext } from "../../contexts/AuthContext";
// import { AuthContext } from "../../contexts/AuthContext";

// type EventProps = {
//   auth: null | AuthContextType;
//   handleLogin: (e: React.MouseEvent<HTMLFormElement>) => void;
// } & React.ComponentPropsWithRef<"form">;

// type AuthPropType = {
//   auth: AuthContextType | null;
// };

type Input = "text" | "password";

const Login = () => {
  const auth = useContext(AuthContext);
  console.log(auth);

  const navigate = useNavigate();

  const [inputType, setInputType] = useState<Input>("password");

  const toast = useToast();

  const LoginRef = useRef<HTMLFormElement>(null!);
  const { current } = LoginRef;

  // const handleLoginError = (error: string) => {
  //   if (
  //     error == AuthErrorCodes.INVALID_PASSWORD ||
  //     error === AuthErrorCodes.INVALID_EMAIL
  //   ) {
  //     const errorMessage =
  //       "Error : Wrong password and email combination.Try again";
  //     return errorMessage;
  //   }
  // };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signInWithEmailAndPassword(
      authenticator,
      current.email.value,
      current.password.value
    )
      .then(() => {
        auth.setIsAuthenticated(true);
        toast?.open("successfully logged in.Welcome", "success");
        navigate("/dashboard/users");
      })
      .catch((err) => {
        toast?.open(err.message, "error");
      });
  };

  // onAuthStateChanged(authenticator, (user) => {
  //   if (user) {
  //     const { email } = user;
  //     auth?.setUser({ ...auth?.user, email: email })!;
  //     // auth?.setUser({ email: email });
  //   }
  // });

  ////////////////////

  const handleToggle = () => {
    setInputType((prev) => {
      if (prev === "password") {
        return "text";
      } else {
        return "password";
      }
    });
  };

  return (
    <form action="" ref={LoginRef} onSubmit={(e) => handleLogin(e)}>
      <h1>Welcome!</h1>
      <label htmlFor="email">email:</label>
      <input type="email" name="email" />
      <label htmlFor="password">password:</label>
      <input type={inputType} name="password" />
      <span onClick={handleToggle}>show</span>

      <button>Login</button>
    </form>
  );
};

export default Login;
