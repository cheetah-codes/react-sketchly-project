import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { useState, useRef, useEffect, useContext } from "react";
import { authenticator } from "../../utils/firebase.config";
import { useToast } from "../../contexts/toast-context";
import { AuthContext, AuthUserType } from "../../contexts/AuthContext";

// type AuthPropType = {
//   auth: AuthContextType | null;
// };

type InputType = "text" | "password";

const Signup = () => {
  const [inputType, setInputType] = useState<InputType>("password");
  const SignupRef = useRef<HTMLFormElement>(null!);
  const { current } = SignupRef;
  const auth = useContext(AuthContext);

  const toast = useToast();

  const handleToggle = () => {
    setInputType((prev) => {
      if (prev === "password") {
        return "text";
      } else {
        return "password";
      }
    });
  };

  useEffect(() => {
    onAuthStateChanged(authenticator, (user: AuthUserType) => {
      if (user) {
        const { email } = user;
        auth!.setUser({ ...auth?.user, email: email })!;
        // auth?.setUser({ email: email });
      } else {
        current.reset();
        toast?.open("unable to register.Please try again", "error");
      }
    });
  }, [authenticator]);

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createUserWithEmailAndPassword(
      authenticator,
      current.email.value,
      current.password.value
    )
      .then((cred) => {
        toast?.open("Sucessfully created an Account.Welcome", "success");
        updateProfile(cred.user, {
          displayName: current.username.value,
        });
      })
      .catch((err) => {
        toast?.open(err.message, "error");
      });
  };
  return (
    <>
      <form>
        <input type="text" name="email" />
        <input type="password" name="password" />
        <button>Sign up</button>
      </form>

      <form action="" ref={SignupRef} onSubmit={(e) => handleSignUp(e)}>
        <h1>Welcome!</h1>
        <label htmlFor="email">email:</label>
        <input type="email" name="email" />
        <label htmlFor="email">username:</label>
        <input type="text" name="username" />
        <label htmlFor="password">password:</label>
        <input type={inputType} name="password" />
        <span onClick={handleToggle}>show</span>

        <button>Sign up</button>
      </form>
    </>
  );
};
export default Signup;
