import { useEffect, useState } from "react";
import { AuthContextType } from "../../contexts/AuthContext";
import { onAuthStateChanged } from "firebase/auth";
import { authenticator } from "../../utils/firebase.config";
import { Outlet, useNavigate } from "react-router";

// const { user, setUser } = useAuth();

export type AuthPropType = AuthContextType &
  React.ComponentProps<"div" | "button" | "form">;

// interface PropType {
//   children?: React.ReactNode;
// }

const AuthLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    authCheck();

    return () => {
      authCheck();
    };
  }, [authenticator]);

  const authCheck = onAuthStateChanged(authenticator, (user: any) => {
    if (user) {
      setLoading(false);
    } else {
      navigate("/login");
    }
  });

  return (
    <>
      <main>
        <Outlet />
      </main>
      {/* {} */}
    </>
  );
};

export default AuthLayout;

//context:set token,initail set to a query fo the local storage
